import { signal } from 'alien-signals';

export type TrackerSize = {
    width: number;
    height: number;
}

export type TrackerSizeSignal = {
    _value: TrackerSize;
    width: ReturnType<typeof signal<number>>;
    height: ReturnType<typeof signal<number>>;
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