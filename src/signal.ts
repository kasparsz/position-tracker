import { signal, isSignal, isComputed } from 'alien-signals';

export type SignalType<T> = ReturnType<typeof signal<T>>;

/**
 * Unsignalify a signal or raw value
 * 
 * @param value The signal or raw value to unsignalify
 * @returns The unsignalified value
 */
export function unSignal<T> (value: SignalType<T>|T):typeof value extends SignalType<T> ? T : T {
    if (value instanceof signal && (isSignal(value) || isComputed(value))) {
        return value() as T;
    } else {
        // Using `as` is dirty, should fix this
        return value as T;
    }
}
