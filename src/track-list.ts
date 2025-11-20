
const TRACKER_PROPERTY = Symbol();
let uid = 0;

/**
 * Returns a unique id for the given elements.
 * 
 * @param elements - The elements to get the id for.
 * @returns The unique id for the given elements.
 */
function getId (...elements: any[]): string {
    return elements
        .filter((element) => !!element)
        .map((element) => {
            if (element[TRACKER_PROPERTY]) {
                return element[TRACKER_PROPERTY];
            } else {
                return element[TRACKER_PROPERTY] = uid++;
            }
        }).join('-');
}

/**
 * A list of trackers.
 */
export class TrackList<T> {
    trackers: Map<string, T> = new Map<string, T>();

    get size () {
        return this.trackers.size;
    }

    get (...elements: any[]): T | undefined {
        return this.trackers.get(getId(...elements));
    }

    has (...elements: any[]): boolean {
        return this.trackers.has(getId(...elements));
    }

    set (tracker: T, ...elements: any[]) {
        const id = getId(...elements);
        (tracker as any)[TRACKER_PROPERTY] = id;
        this.trackers.set(id, tracker);
    }

    delete (...elements: any[]) {
        this.trackers.delete(getId(...elements));
    }
}