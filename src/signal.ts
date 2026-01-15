import { signal, isSignal, isComputed } from 'alien-signals';

export type SignalType<T> = ReturnType<typeof signal<T>>;

/**
 * Unsignalify a signal or raw value
 * 
 * @param value The signal or raw value to unsignalify
 * @returns The unsignalified value
 */
export function unSignal<T> (value: SignalType<T>|T):typeof value extends SignalType<T> ? T : T {
    if (value && (isSignal(value as any) || isComputed(value as any))) {
        return (value as () => void)() as T;
    } else {
        // Using `as` is dirty, should fix this
        return value as T;
    }
}
