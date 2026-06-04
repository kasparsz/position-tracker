import frameLoop from "./frame-loop";
// import { frame, cancelFrame } from "motion";

type SignalLibrary<T> = {
    signal: (value: any) => T;
    unSignal: (signal: T) => any;
    setSignal: (signal: T, value: any) => void;
    startBatch: () => void;
    endBatch: () => void;
}

/**
 * Global tracker configuration
 */
export const config = {
    // Frame loop functions, allows to overwrite the default frame loop functions
    frameLoop,

    // Frame loop overrides if using motion.dev
    // frameLoop: {
    //     setup: (callback: () => void , once = false) => {
    //         frame.setup(callback, once);
    //         return () => cancelFrame(callback);
    //     },
    //     read: (callback: () => void, once = false) => {
    //         frame.read(callback, once);
    //         return () => cancelFrame(callback);
    //     },
    //     update: (callback: () => void, once = false) => {
    //         frame.update(callback, once);
    //         return () => cancelFrame(callback);
    //     },
    //     render: (callback: () => void, once = false) => {
    //         frame.render(callback, once);
    //         return () => cancelFrame(callback);
    //     },
    // },

    // Signal functions
    signal: {
        signal: null,
        unSignal: null,
        setSignal: null,
        startBatch: null,
        endBatch: null,
    } as unknown as SignalLibrary<any>,
}

// Because config can be overwritten, we need to create a wrapper for the frame loop functions
export const frame = {
    get setup () {
        return config.frameLoop.setup;
    },
    get read () {
        return config.frameLoop.read;
    },
    get update () {
        return config.frameLoop.update;
    },
    get render () {
        return config.frameLoop.render;
    },
}

// Because config can be overwritten, we need to create a wrapper for the signal functions
export const signal = {
    get signal () {
        return config.signal.signal;
    },
    get unSignal () {
        return config.signal.unSignal;
    },
    get setSignal () {
        return config.signal.setSignal;
    },
    get startBatch () {
        return config.signal.startBatch;
    },
    get endBatch () {
        return config.signal.endBatch;
    },
}