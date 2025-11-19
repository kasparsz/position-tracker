
const SYMBOL_TRACKER = Symbol();
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
            if (element[SYMBOL_TRACKER]) {
                return element[SYMBOL_TRACKER];
            } else {
                return element[SYMBOL_TRACKER] = uid++;
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
        (tracker as any)[SYMBOL_TRACKER] = id;
        this.trackers.set(id, tracker);
    }

    delete (...elements: any[]) {
        this.trackers.delete(getId(...elements));
    }
}