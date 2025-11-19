import { signal } from 'alien-signals';

export type TrackerPosition = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export type TrackerPositionAsSignal = {
    left: ReturnType<typeof signal<number>>;
    top: ReturnType<typeof signal<number>>;
    right: ReturnType<typeof signal<number>>;
    bottom: ReturnType<typeof signal<number>>;
}

export type TrackerPositionSignal = {
    _value: TrackerPosition;
    left: ReturnType<typeof signal<number>>;
    top: ReturnType<typeof signal<number>>;
    right: ReturnType<typeof signal<number>>;
    bottom: ReturnType<typeof signal<number>>;
    toJSON: () => TrackerPosition;
}

export function isSignalTrackerPosition (position: TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal): position is TrackerPositionAsSignal;
export function isSignalTrackerPosition (position: TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal): position is TrackerPositionSignal {
    return position && typeof position.left === 'function' && typeof position.top === 'function' && typeof position.right === 'function' && typeof position.bottom === 'function';
}

/**
 * Creates a signal tracker position
 * 
 * @param left The left position
 * @param top The top position
 * @param right The right position
 * @param bottom The bottom position
 * @returns The signal tracker position
 */
export function trackerPosition (left: number, top: number, right: number, bottom: number): TrackerPositionSignal {
    return {
        _value: {
            left,
            top,
            right,
            bottom
        },
        left: signal(left),
        top: signal(top),
        right: signal(right),
        bottom: signal(bottom),
        toJSON () {
            this._value.left = this.left();
            this._value.top = this.top();
            this._value.right = this.right();
            this._value.bottom = this.bottom();
            return this._value;
        }
    };
}