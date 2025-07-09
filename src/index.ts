import { roundSubPixels } from './utils/round';
import { TrackList } from './track-list';
import frameLoop from './frame-loop';

const trackerList = new TrackList();
const voidCallback = () => {};

type TrackerOptions = {
}

type TrackerSize = {
    width: number;
    height: number;
}

type TrackerPosition = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

type TrackerCallback = (tracker: Tracker) => void;

class Tracker {
    element: HTMLElement|Element;
    relative?: Tracker;

    // Last know position
    position: TrackerPosition = { left: 0, top: 0, right: 0, bottom: 0 };
    
    // Last know size
    size: TrackerSize = { width: 0, height: 0 };

    // Position relative to the relativeHTMLElement or window
    relativePosition: TrackerPosition = { left: 0, top: 0, right: 0, bottom: 0 };

    // Change callbacks
    _changeCallbacks: Set<TrackerCallback> = new Set();

    // Is dirty
    _dirty: boolean = true;

    // Has changed
    _changed: boolean = false;

    // Loop callbacks
    _isListening: boolean = false;
    _loopReset: (() => void) | null = null;
    _loopRead: (() => void) | null = null;
    _loopUpdate: (() => void) | null = null;

    _relativeOnChange: (() => void) | null = null;

    constructor (element: HTMLElement|Element, relativeHTMLElement?: HTMLElement|Element|Document|Window, _options?: TrackerOptions) {
        this.element = element;

        if (relativeHTMLElement && !(relativeHTMLElement instanceof Window)) {
            this.relative = track(relativeHTMLElement);
        }
    }
    
    _listen () {
        if (!this._isListening) {
            this._isListening = true;

            this._loopReset = frameLoop.reset(this._reset.bind(this), true);
            this._loopRead = frameLoop.read(this._update.bind(this), true);
            this._loopUpdate = frameLoop.update(this._emit.bind(this), true);

            if (this.relative) {
                this._relativeOnChange = this.relative.on(voidCallback);
            }

            trackerList.set(this, this.element, this.relative?.element);
        }
    }
    _unlisten () {
        if (this._isListening) {
            this._isListening = false;

            if (this._loopReset) {
                this._loopReset();
                this._loopReset = null;
            }
            if (this._loopRead) {
                this._loopRead();
                this._loopRead = null;
            }
            if (this._loopUpdate) {
                this._loopUpdate();
                this._loopUpdate = null;
            }

            if (this._relativeOnChange) {
                this._relativeOnChange();
                this._relativeOnChange = null;
            }

            trackerList.delete(this);
        }
    }

    on (callback: TrackerCallback) {
        this._changeCallbacks.add(callback);
        this._listen();

        return () => {
            this._changeCallbacks.delete(callback);

            if (!this._changeCallbacks.size) {
                this._unlisten();
            }
        }
    }

    _reset () {
        this._dirty = true;
        this._changed = false;

        if (this.relative) {
            this.relative._reset();
        }
    }

    _update () {
        if (this._dirty) {
            this._dirty = false;
            
            const { element, relative, position, size, relativePosition } = this;
            const rects = element.getClientRects();

            if (relative) {
                relative._update();
            }
            
            if (rects.length) {
                const rect = rects[0];

                const left = roundSubPixels(rect.left);
                const top = roundSubPixels(rect.top);
                const right = roundSubPixels(rect.left + rect.width);
                const bottom = roundSubPixels(rect.top + rect.height);
                const width = roundSubPixels(rect.width);
                const height = roundSubPixels(rect.height);

                // We need to round sub-pixel values to avoid floating point errors because of transforms
                const newLeft = relative ? roundSubPixels(left - relative.position.left) : left;
                const newTop = relative ? roundSubPixels(top - relative.position.top) : top;
                const newRight = relative ? roundSubPixels(relative.position.right - right) : roundSubPixels(document.documentElement.clientWidth - right);
                const newBottom = relative ? roundSubPixels(relative.position.bottom - bottom) : roundSubPixels(window.innerHeight - bottom);

                position.left = left;
                position.top = top;
                position.right = right;
                position.bottom = bottom;

                if (size.width !== width || size.height !== height) {
                    size.width = width;
                    size.height = height;
                    this._changed = true;
                }

                if (relativePosition.left !== newLeft || relativePosition.top !== newTop || relativePosition.right !== newRight || relativePosition.bottom !== newBottom) {
                    relativePosition.left = newLeft;
                    relativePosition.top = newTop;
                    relativePosition.right = newRight;
                    relativePosition.bottom = newBottom;
                    this._changed = true;
                }
            }
        }
    }

    _emit () {
        if (this._changed) {
            this._changeCallbacks.forEach((callback) => {
                callback(this);
            });
        }
    }
}

export function track (element: HTMLElement|Element|Document, relativeElement?: HTMLElement|Element|Document|Window, options?: TrackerOptions):Tracker {
    const htmlElement = element instanceof Document ? document.body : element;
    const relativeHTMLElement = relativeElement instanceof Window ? undefined : relativeElement;

    if (trackerList.has(htmlElement, relativeHTMLElement)) {
        return trackerList.get(htmlElement, relativeHTMLElement)!;
    } else {
        return new Tracker(htmlElement, relativeHTMLElement, options);
    }
}

export { frameLoop };

export type { Tracker, TrackerOptions, TrackerSize, TrackerPosition, TrackerCallback };