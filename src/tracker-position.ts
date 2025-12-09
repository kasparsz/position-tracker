import { signal } from 'alien-signals';
import type { SignalType } from './signal';

const SYMBOL_IS_SIGNAL_TRACKER_POSITION = Symbol('isSignalTrackerPosition');

export type TrackerPosition = {
    [SYMBOL_IS_SIGNAL_TRACKER_POSITION]?: false;
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export type TrackerPositionAsSignal = {
    [SYMBOL_IS_SIGNAL_TRACKER_POSITION]?: true;
    left: SignalType<number>;
    top: SignalType<number>;
    right: SignalType<number>;
    bottom: SignalType<number>;
}

export type TrackerPositionSignal = {
    [SYMBOL_IS_SIGNAL_TRACKER_POSITION]?: true;
    _value: TrackerPosition;
    left: SignalType<number>;
    top: SignalType<number>;
    right: SignalType<number>;
    bottom: SignalType<number>;
    toJSON: () => TrackerPosition;
}

export function isSignalTrackerPosition (position: TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal): position is TrackerPositionAsSignal;
export function isSignalTrackerPosition (position: TrackerPosition|TrackerPositionSignal|TrackerPositionAsSignal): position is TrackerPositionSignal {
    if (position && (SYMBOL_IS_SIGNAL_TRACKER_POSITION in position)) {
        return position[SYMBOL_IS_SIGNAL_TRACKER_POSITION] === true;
    } else {
        if (position && typeof position.left === 'function' && typeof position.top === 'function' && typeof position.right === 'function' && typeof position.bottom === 'function') {
            position[SYMBOL_IS_SIGNAL_TRACKER_POSITION] = true;
            return true;
        } else {
            position[SYMBOL_IS_SIGNAL_TRACKER_POSITION] = false;
            return false;
        }
    }
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