import { config } from './config';

export type TrackerSize = {
    width: number;
    height: number;
}

export type TrackerSizeSignal = {
    _value: TrackerSize;
    width: any;
    height: any;
    toJSON (): TrackerSize;
}

export function trackerSize (width: number, height: number): TrackerSizeSignal {
    return {
        _value: { width, height },
        width: config.signal.signal(width),
        height: config.signal.signal(height),
        toJSON () {
            this._value.width = config.signal.unSignal(this.width);
            this._value.height = config.signal.unSignal(this.height);
            return this._value;
        }
    };
}