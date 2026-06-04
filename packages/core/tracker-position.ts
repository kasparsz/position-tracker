import { config } from './config';

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
    left: any;
    top: any;
    right: any;
    bottom: any;
}

export type TrackerPositionSignal = {
    [SYMBOL_IS_SIGNAL_TRACKER_POSITION]?: true;
    _value: TrackerPosition;
    left: any;
    top: any;
    right: any;
    bottom: any;
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
        left: config.signal.signal(left),
        top: config.signal.signal(top),
        right: config.signal.signal(right),
        bottom: config.signal.signal(bottom),
        toJSON () {
            this._value.left = config.signal.unSignal(this.left);
            this._value.top = config.signal.unSignal(this.top);
            this._value.right = config.signal.unSignal(this.right);
            this._value.bottom = config.signal.unSignal(this.bottom);
            return this._value;
        }
    };
}