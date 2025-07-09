import { roundSubPixels } from './utils/round';
import { TrackList } from './track-list';
import { config } from './config';

const trackerList = new TrackList();
const voidCallback = () => {};

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
type TrackedCallbackItem = {
    callback: TrackerCallback;
    position: boolean;
    size: boolean;
    once: boolean;
}

type VirtualTracker = {
    position: TrackerPosition;
    update?: () => void;
}

function isVirtualTracker (tracker: any): tracker is VirtualTracker {
    return tracker && !('element' in tracker && 'update' in tracker) && 'position' in tracker;
}

const PROP_CALLBACKS = Symbol();
const PROP_DIRTY = Symbol();
const PROP_POSITION_CHANGED = Symbol();
const PROP_SIZE_CHANGED = Symbol();
const PROP_IS_LOOP_ATTACHED = Symbol();
const PROP_IS_PAUSED = Symbol();
const PROP_REMOVE_LOOP_RESET = Symbol();
const PROP_REMOVE_LOOP_READ = Symbol();
const PROP_REMOVE_LOOP_UPDATE = Symbol();
const PROP_REMOVE_RELATIVE_CHANGE_LISTENER = Symbol();

const FN_OFF = Symbol();
const FN_ADD_TO_LOOP = Symbol();
const FN_REMOVE_FROM_LOOP = Symbol();
const FN_RESET = Symbol();
const FN_EMIT = Symbol();

class Tracker {
    element: HTMLElement|Element;
    relative?: Tracker|VirtualTracker;

    // Last know position
    position: TrackerPosition = { left: 0, top: 0, right: 0, bottom: 0 };
    
    // Last know size
    size: TrackerSize = { width: 0, height: 0 };

    // Position relative to the relativeHTMLElement or window
    relativePosition: TrackerPosition = { left: 0, top: 0, right: 0, bottom: 0 };

    // Change callbacks
    [PROP_CALLBACKS]: Set<TrackedCallbackItem> = new Set();

    // Is dirty
    [PROP_DIRTY]: boolean = true;

    // Has changed
    [PROP_POSITION_CHANGED]: boolean = false;
    [PROP_SIZE_CHANGED]: boolean = false;

    // Is tracker attached to the frame loop
    [PROP_IS_LOOP_ATTACHED]: boolean = false;

    // Is tracker paused, while paused it will not emit changes
    [PROP_IS_PAUSED]: boolean = false;

    // Loop callbacks
    [PROP_REMOVE_LOOP_RESET]: (() => void) | null = null;
    [PROP_REMOVE_LOOP_READ]: (() => void) | null = null;
    [PROP_REMOVE_LOOP_UPDATE]: (() => void) | null = null;

    // Listener for relative tracker changes
    [PROP_REMOVE_RELATIVE_CHANGE_LISTENER]: (() => void) | null = null;

    constructor (element: HTMLElement|Element, relativeHTMLElement?: HTMLElement|Element|Document|Window|VirtualTracker) {
        this.element = element;

        if (isVirtualTracker(relativeHTMLElement)) {
            this.relative = relativeHTMLElement;
        } else if (relativeHTMLElement && !(relativeHTMLElement instanceof Window)) {
            this.relative = track(relativeHTMLElement);
        }
    }
    
    /**
     * Add the tracker to the frame loop
     * Called when the tracker has callbacks
     * 
     * @private
     */
    [FN_ADD_TO_LOOP] () {
        if (!this[PROP_IS_LOOP_ATTACHED]) {
            this[PROP_IS_LOOP_ATTACHED] = true;

            this[PROP_REMOVE_LOOP_RESET] = config.frameLoop.setup(this[FN_RESET].bind(this), true);
            this[PROP_REMOVE_LOOP_READ] = config.frameLoop.read(this.update.bind(this), true);
            this[PROP_REMOVE_LOOP_UPDATE] = config.frameLoop.update(this[FN_EMIT].bind(this), true);

            if (this.relative && !isVirtualTracker(this.relative)) {
                this[PROP_REMOVE_RELATIVE_CHANGE_LISTENER] = (this.relative as Tracker).on(voidCallback);
            }

            if (!isVirtualTracker(this.relative)) {
                trackerList.set(this, this.element);
            } else {
                trackerList.set(this, this.element, (this.relative as Tracker)?.element);
            }
        }
    }

    /**
     * Remove the tracker from the frame loop
     * Called when the tracker doesn't have any callbacks anymore
     * 
     * @private
     */
    [FN_REMOVE_FROM_LOOP] (deleteFromList: boolean = true) {
        if (this[PROP_IS_LOOP_ATTACHED]) {
            this[PROP_IS_LOOP_ATTACHED] = false;

            this[PROP_REMOVE_LOOP_RESET]?.();
            this[PROP_REMOVE_LOOP_READ]?.();
            this[PROP_REMOVE_LOOP_UPDATE]?.();

            if (this[PROP_REMOVE_RELATIVE_CHANGE_LISTENER]) {
                this[PROP_REMOVE_RELATIVE_CHANGE_LISTENER]();
                this[PROP_REMOVE_RELATIVE_CHANGE_LISTENER] = null;
            }

            if (deleteFromList) {
                trackerList.delete(this);
            }
        }
    }

    /**
     * Add event listener to the tracker
     * 
     * @param callback - The callback function to call when the tracker changes
     * @param options - The options for the callback
     * @returns A function to remove the callback
     */
    on (callback: TrackerCallback, options?: { position?: boolean, size?: boolean, once?: boolean }) {
        const position = options?.position ?? true;
        const size = options?.size ?? true;
        const once = options?.once ?? false;

        const item: TrackedCallbackItem = {
            callback: !once ? callback : (() => {
                this[FN_OFF](item);
                callback(this);
            }),
            position,
            size,
            once,
        };

        this[PROP_CALLBACKS].add(item);
        this[FN_ADD_TO_LOOP]();

        // Return a function to remove the callback
        return this[FN_OFF].bind(this, item);
    }

    /**
     * Remove event listener from the tracker
     * 
     * @param callback - The callback function to remove
     */
    off (callback: TrackerCallback) {
        this[PROP_CALLBACKS].forEach((item) => {
            if (item.callback === callback) {
                this[FN_OFF](item);
            }
        });
    }

    /**
     * Pause tracking
     */
    pause () {
        this[PROP_IS_PAUSED] = true;
        this[FN_REMOVE_FROM_LOOP](false);
    }

    /**
     * Resume tracking
     */
    resume () {
        this[PROP_IS_PAUSED] = false;

        if (this[PROP_CALLBACKS].size) {
            this[FN_ADD_TO_LOOP]();
        }
    }

    /**
     * Remove event listener from the tracker
     * 
     * @param item - The callback item to remove
     * @private
     */
    [FN_OFF] (item: TrackedCallbackItem) {
        this[PROP_CALLBACKS].delete(item);

        if (!this[PROP_CALLBACKS].size) {
            this[FN_REMOVE_FROM_LOOP]();
        }
    }

    /**
     * Reset the tracker state
     * Called by the frame loop
     * 
     * @private
     */
    [FN_RESET] () {
        this[PROP_DIRTY] = true;
        this[PROP_POSITION_CHANGED] = false;
        this[PROP_SIZE_CHANGED] = false;
    }

    /**
     * Update the tracker state
     * Called by the frame loop
     */
    update () {
        if (this[PROP_DIRTY]) {
            this[PROP_DIRTY] = false;
            
            const { element, relative, position, size, relativePosition } = this;
            const rects = element.getClientRects();

            if (relative) {
                relative.update?.();
            }
            
            if (rects.length) {
                const rect = rects[0];

                const left = position.left = roundSubPixels(rect.left);
                const top = position.top = roundSubPixels(rect.top);
                const right = position.right = roundSubPixels(rect.left + rect.width);
                const bottom = position.bottom = roundSubPixels(rect.top + rect.height);
                const width = roundSubPixels(rect.width);
                const height = roundSubPixels(rect.height);

                // We need to round sub-pixel values to avoid floating point errors because of transforms
                const newLeft = relative ? roundSubPixels(left - relative.position.left) : left;
                const newTop = relative ? roundSubPixels(top - relative.position.top) : top;
                const newRight = relative ? roundSubPixels(relative.position.right - right) : roundSubPixels(document.documentElement.clientWidth - right);
                const newBottom = relative ? roundSubPixels(relative.position.bottom - bottom) : roundSubPixels(window.innerHeight - bottom);

                if (size.width !== width || size.height !== height) {
                    size.width = width;
                    size.height = height;
                    this[PROP_SIZE_CHANGED] = true;
                }

                if (relativePosition.left !== newLeft || relativePosition.top !== newTop || relativePosition.right !== newRight || relativePosition.bottom !== newBottom) {
                    relativePosition.left = newLeft;
                    relativePosition.top = newTop;
                    relativePosition.right = newRight;
                    relativePosition.bottom = newBottom;
                    this[PROP_POSITION_CHANGED] = true;
                }
            }
        }
    }

    /**
     * Emit the tracker changes
     * Called by the frame loop
     * 
     * @private
     */
    [FN_EMIT] () {
        this[PROP_CALLBACKS].forEach((item) => {
            if ((item.position && this[PROP_POSITION_CHANGED]) || (item.size && this[PROP_SIZE_CHANGED])) {
                item.callback(this);
            }
        });
    }
}

/**
 * Track an element
 * 
 * @param element - The element to track
 * @param relativeElement - The element to track relative to
 * @returns The tracker instance
 */
export function track (element: HTMLElement|Element|Document, relativeElement?: HTMLElement|Element|Document|Window|VirtualTracker):Tracker {
    // If element is a document, use the body as the element which to track because properties like getClientRects
    // are not available on the document
    const htmlElement = element instanceof Document || element instanceof HTMLHtmlElement ? document.body : element;

    // If relative element is a window, use undefined because when tracking htmlElement it uses getClientRects which
    // returns values that are relative to the window already
    const relativeHTMLElement = relativeElement instanceof Window ? undefined : relativeElement;

    if (trackerList.has(htmlElement, relativeHTMLElement)) {
        return trackerList.get(htmlElement, relativeHTMLElement)!;
    } else {
        return new Tracker(htmlElement, relativeHTMLElement);
    }
}

export const frame = {
    get setup () {
        return config.frameLoop.setup;
    },
    get read () {
        return config.frameLoop.read;
    },
    get update () {
        return config.frameLoop.update;
    },
    get render () {
        return config.frameLoop.render;
    },
}

export { config };

export type { Tracker, TrackerSize, TrackerPosition, TrackerCallback, VirtualTracker };
