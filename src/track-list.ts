import type { Tracker } from './index';

const TRACKER_SYMBOL = Symbol('tracker');
    
export class TrackList {
    trackers: Map<string, Tracker> = new Map<string, Tracker>();
    idCounter: number = 0;

    get size () {
        return this.trackers.size;
    }

    getId (...elements: any[]): string {
        return elements
            .filter((element) => !!element)
            .map((element) => {
                if (element[TRACKER_SYMBOL]) {
                    return element[TRACKER_SYMBOL];
                } else {
                    const id = this.idCounter++;
                    element[TRACKER_SYMBOL] = id;
                    return id;
                }
            }).join('-');
    }

    get (...elements: any[]): Tracker | undefined {
        return this.trackers.get(this.getId(...elements));
    }

    has (...elements: any[]): boolean {
        return this.trackers.has(this.getId(...elements));
    }

    set (tracker: Tracker, ...elements: any[]) {
        const id = this.getId(...elements);
        (tracker as any)[TRACKER_SYMBOL] = id;
        return this.trackers.set(id, tracker);
    }

    delete (...elements: any[]) {
        return this.trackers.delete(this.getId(...elements));
    }
}