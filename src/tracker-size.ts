import { signal } from 'alien-signals';
import type { SignalType } from './signal';

export type TrackerSize = {
    width: number;
    height: number;
}

export type TrackerSizeSignal = {
    _value: TrackerSize;
    width: SignalType<number>;
    height: SignalType<number>;
    toJSON (): TrackerSize;
}

export function trackerSize (width: number, height: number): TrackerSizeSignal {
    return {
        _value: { width, height },
        width: signal(width),
        height: signal(height),
        toJSON () {
            this._value.width = this.width();
            this._value.height = this.height();
            return this._value;
        }
    };
}