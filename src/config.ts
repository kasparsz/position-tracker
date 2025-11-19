import frameLoop from "./frame-loop";
// import { frame, cancelFrame } from "motion";

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