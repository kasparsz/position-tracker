import frameLoop from "./frame-loop";
// import { frame, cancelFrame } from "motion";

/**
 * Global tracker configuration
 */
export const config = {
    useSignal: false,

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