import { toValue, isRef, watch, type Ref, onScopeDispose } from 'vue';
import { track, type Tracker } from '../core/tracker';
import { type TrackerPositionSignal, type TrackerPosition, type TrackerPositionAsSignal } from '../core/tracker-position';
import { type VirtualTracker } from '../core/virtual-tracker';

/**
 * Track an element
 * 
 * @param element - The element to track
 * @param relativeElement - The element to track relative to
 * @returns - The tracker instance
 */
export function useTracker(element: HTMLElement|Element|Document|Ref<HTMLElement|Element|Document|null|undefined>, relativeElement: HTMLElement|Element|Document|Window|Tracker|Ref<HTMLElement|Element|Document|null|undefined>|VirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>|null = null) {
    const tracker = track(toValue(element) || null, toValue(relativeElement) || null);

    if (isRef(element)) {
        watch([element], () => {
            tracker.setElement(toValue(element) || null);
        });
    }
    
    if (isRef(relativeElement)) {
        watch([relativeElement], () => {
            tracker.setRelativeElement(toValue(relativeElement as Ref<HTMLElement|Element|Document|Window|Tracker|VirtualTracker<TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal>|null>) || null);
        });
    }

    onScopeDispose(() => {
        tracker.destroy();
    });

    return tracker;
}