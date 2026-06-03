import { ref, type Ref, toValue } from 'vue';
import { config } from '../core/config';

export type SignalType<T = any, S = T> = Ref<T, S>;

/**
 * Set a signal's value
 * 
 * @param signal The signal to set
 * @param value The value to set
 */
function setSignal<T> (signal: SignalType<T>, value: T) {
    signal.value = value;
}

export const unSignal = toValue;

config.signal = {
    unSignal: toValue,
    setSignal,
    signal: ref,
    startBatch: () => {},
    endBatch: () => {},
}

export * from '../core/index';