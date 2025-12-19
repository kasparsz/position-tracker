import { roundSubPixels } from './utils/round';
import { TrackList } from './track-list';
import { config } from './config';
import { trackerSize, type TrackerSizeSignal } from './tracker-size';
import { trackerPosition, type TrackerPositionSignal, type TrackerPosition, type TrackerPositionAsSignal } from './tracker-position';
import { addedTracker, removedTracker } from './signal-batch';
import { unsignalifyVirtualTracker, isVirtualTracker, type VirtualTracker } from './virtual-tracker';
import { signal } from 'alien-signals';
import type { SignalType } from './signal';

// Global tracker list
const trackerList = new TrackList<Tracker>();
const voidCallback = () => {};

type TrackerCallback = (tracker: Tracker) => void;
type TrackedCallbackItem = {
    callback: TrackerCallback;
    position: boolean;
    size: boolean;
    once: boolean;
}

class Tracker {
    element: HTMLElement|Element;
    relative?: Tracker|VirtualTracker;

    // Last know position
    position: TrackerPositionSignal = trackerPosition(0, 0, 0, 0);
    
    // Last know size
    size: TrackerSizeSignal = trackerSize(0, 0);

    // Position relative to the relativeHTMLElement or window
    relativePosition: TrackerPositionSignal = trackerPosition(0, 0, 0, 0);

    // Element is visible or not
    visible: SignalType<boolean> = signal(false);

    // Change callbacks
    #callbacks: Set<TrackedCallbackItem> = new Set();

    // Is dirty
    #isDirty: boolean = true;

    // Is tracker paused, while paused it will not emit changes
    #isPaused: boolean = false;

    // Is tracker attached to the frame loop
    #isLoopAttached: boolean = false;

    // State of which properties changed
    #didPositionChanged: boolean = false;
    #didSizeChanged: boolean = false;
    #didVisibleChanged: boolean = false;

    // Loop callbacks
    #removeLoopReset: (() => void) | null = null;
    #removeLoopRead: (() => void) | null = null;
    #removeLoopUpdate: (() => void) | null = null;

    // Listener for relative tracker changes
    #removeRelativeChangeListener: (() => void) | null = null;

    constructor (element: HTMLElement|Element, relativeHTMLElement?: HTMLElement|Element|Document|Window|VirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>) {
        this.element = element;

        if (isVirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>(relativeHTMLElement)) {
            // Virtual tracker is a tracker that is not attached to the DOM,
            // coordinates are relative to the viewport
            this.relative = unsignalifyVirtualTracker(relativeHTMLElement);
            // console.log(this.relative);
        } else if (relativeHTMLElement && !(relativeHTMLElement instanceof Window)) {
            // Because we use getClientRects values are relative to the viewport already
            // so we only need to track the relative element if it's not a window
            this.relative = track(relativeHTMLElement);
        }

        this.#addToLoop();
    }
    
    /**
     * Add the tracker to the frame loop
     * Called when the tracker has callbacks
     * 
     * @private
     */
    #addToLoop () {
        if (!this.#isLoopAttached) {
            this.#isLoopAttached = true;

            // Mark that tracker was added, this is needed for signal batching
            addedTracker();

            // Add the tracker to the frame loop and save the remove function (to remove the tracker from the frame loop)
            this.#removeLoopReset = config.frameLoop.setup(this.#reset.bind(this));
            this.#removeLoopRead = config.frameLoop.read(this.update.bind(this));
            this.#removeLoopUpdate = config.frameLoop.update(this.#emit.bind(this));

            // Add empty listener to the relative tracker because tracker will not actually track changes until it's added to the frame loop
            // and it's only added to the frame loop when it has listeners
            if (this.relative && !isVirtualTracker(this.relative)) {
                this.#removeRelativeChangeListener = (this.relative as Tracker).on(voidCallback);
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
    #removeFromLoop (deleteFromList: boolean = true) {
        if (this.#isLoopAttached) {
            this.#isLoopAttached = false;

            // Remove the tracker from the frame loop
            this.#removeLoopReset?.();
            this.#removeLoopRead?.();
            this.#removeLoopUpdate?.();
            this.#removeRelativeChangeListener?.();

            this.#removeLoopReset = null;
            this.#removeLoopRead = null;
            this.#removeLoopUpdate = null;
            this.#removeRelativeChangeListener = null;

            // Mark that tracker was removed, this is needed for signal batching
            removedTracker();

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
                this.#removeEventListener(item);
                callback(this);
            }),
            position,
            size,
            once,
        };

        this.#callbacks.add(item);
        this.#addToLoop();

        // Return a function to remove the callback
        return this.#removeEventListener.bind(this, item);
    }

    /**
     * Remove event listener from the tracker
     * 
     * @param callback - The callback function to remove
     */
    off (callback: TrackerCallback) {
        this.#callbacks.forEach((item) => {
            if (item.callback === callback) {
                this.#removeEventListener(item);
            }
        });
    }

    /**
     * Pause tracking
     */
    pause () {
        this.#isPaused = true;
        this.#removeFromLoop(false);
    }

    /**
     * Resume tracking
     */
    resume () {
        this.#isPaused = false;
        this.#addToLoop();
    }

    /**
     * Remove event listener from the tracker
     * 
     * @param item - The callback item to remove
     * @private
     */
    #removeEventListener (item: TrackedCallbackItem) {
        this.#callbacks.delete(item);

        if (!this.#callbacks.size) {
            this.#removeFromLoop();
        }
    }

    /**
     * Reset the tracker state
     * Called by the frame loop
     * 
     * @private
     */
    #reset () {
        this.#isDirty = true;
        this.#didPositionChanged = false;
        this.#didSizeChanged = false;
        this.#didVisibleChanged = false;
    }

    /**
     * Update the tracker state
     * Called by the frame loop
     */
    update () {
        if (this.#isDirty && !this.#isPaused) {
            this.#isDirty = false;

            const { element, relative, position, size, relativePosition, visible } = this;
            const sizeJSON = size.toJSON();
            const positionJSON = position.toJSON();
            const relativePositionJSON = relativePosition.toJSON();
            const relativeElementPositionJSON = relative? ('toJSON' in relative.position ? relative.position.toJSON() : relative.position) : null;
            const rects = element.getClientRects();

            if (relative) {
                relative.update?.();
            }
            
            if (rects.length) {
                const rect = rects[0];

                const left = positionJSON.left = roundSubPixels(rect.left);
                const top = positionJSON.top = roundSubPixels(rect.top);
                const right = positionJSON.right = roundSubPixels(rect.left + rect.width);
                const bottom = positionJSON.bottom = roundSubPixels(rect.top + rect.height);
                
                position.left(left);
                position.top(top);
                position.right(right);
                position.bottom(bottom);

                // Update size
                const width = roundSubPixels(rect.width);
                const height = roundSubPixels(rect.height);

                if (sizeJSON.width !== width || sizeJSON.height !== height) {
                    size.width(width);
                    size.height(height);

                    this.#didSizeChanged = true;
                }
                
                // Update relative position
                // We need to round sub-pixel values to avoid floating point errors because of transforms
                const newLeft = relativeElementPositionJSON ? roundSubPixels(left - relativeElementPositionJSON.left) : left;
                const newTop = relativeElementPositionJSON ? roundSubPixels(top - relativeElementPositionJSON.top) : top;
                const newRight = relativeElementPositionJSON ? roundSubPixels(relativeElementPositionJSON.right - right) : roundSubPixels(document.documentElement.clientWidth - right);
                const newBottom = relativeElementPositionJSON ? roundSubPixels(relativeElementPositionJSON.bottom - bottom) : roundSubPixels(window.innerHeight - bottom);

                if (relativePositionJSON.left !== newLeft || relativePositionJSON.top !== newTop || relativePositionJSON.right !== newRight || relativePositionJSON.bottom !== newBottom) {
                    relativePosition.left(newLeft);
                    relativePosition.top(newTop);
                    relativePosition.right(newRight);
                    relativePosition.bottom(newBottom);

                    this.#didPositionChanged = true;
                }

                if (!visible()) {
                    visible(true);
                    this.#didVisibleChanged = true;
                }
            } else {
                if (visible()) {
                    visible(false);
                    this.#didVisibleChanged = true;
                }
            }
        }
    }

    /**
     * Destroy the tracker
     */
    destroy () {
        this.#removeFromLoop();
        this.#callbacks.clear();
        this.relative = undefined;
        this.#isPaused = true;
    }

    /**
     * Emit the tracker changes
     * Called by the frame loop
     * 
     * @private
     */
    #emit () {
        this.#callbacks.forEach((item) => {
            if ((item.position && this.#didPositionChanged) || (item.size && this.#didSizeChanged) || this.#didVisibleChanged) {
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
export function track (element: HTMLElement|Element|Document, relativeElement?: HTMLElement|Element|Document|Window|VirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>):Tracker {
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

export type { Tracker, TrackerCallback };
