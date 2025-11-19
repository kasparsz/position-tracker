import { type Tracker } from './tracker';
import { type TrackerPositionSignal, type TrackerPosition, type TrackerPositionAsSignal, isSignalTrackerPosition } from './tracker-position';

export type VirtualTracker<T = TrackerPosition|TrackerPositionSignal> = {
    position: T;
    update?: () => void;
}

export function isVirtualTracker<T> (tracker: any): tracker is VirtualTracker<T> {
    return tracker && !('element' in tracker && 'update' in tracker) && 'position' in tracker;
}

/**
 * Removes signals from the VirtualTracker position
 * 
 * @param tracker The tracker to unsignalify
 * @returns The unsignalified tracker
 */
export function unsignalifyVirtualTracker (tracker: Tracker|VirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>): Tracker|VirtualTracker<TrackerPosition> {
    const position = tracker.position;

    if (isVirtualTracker<typeof tracker>(tracker) && isSignalTrackerPosition(position)) {
        return {
            position: {
                left: position.left(),
                top: position.top(),
                right: position.right(),
                bottom: position.bottom()
            },
            update() {
                if (tracker.update) {
                    tracker.update();
                }

                this.position.left = position.left();
                this.position.top = position.top();
                this.position.right = position.right();
                this.position.bottom = position.bottom();
            }
        }
    } else {
        return tracker as Tracker;
    }
}