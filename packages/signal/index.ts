import { signal, computed, effect, isSignal, isComputed, isEffect, effectScope, startBatch, endBatch } from 'alien-signals';
import { config } from '../core/config';

export * from 'alien-signals';
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

/**
 * Set a signal's value
 * 
 * @param signal The signal to set
 * @param value The value to set
 */
function setSignal<T> (signal: SignalType<T>, value: T) {
    signal(value);
}

config.signal = {
    unSignal,
    setSignal,
    signal,
    computed,
    effect,
    isSignal,
    isComputed,
    isEffect,
    effectScope,
    startBatch,
    endBatch,
}

export * from '../core/index';