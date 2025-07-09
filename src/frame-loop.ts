/**
 * Frame loop functions
 * API inspired by motion.dev frame loop
 * 
 * It's a simple frame loop that runs the callbacks in the order of the steps
 * It's also responsible for the cleanup of the callbacks
 */
let isTimerRunning = false;

type FrameLoopCallback = (time: number) => any;

type FrameLoopItem = {
    fn: FrameLoopCallback,
    once: boolean,
}

const steps = {
    setup: new Set<FrameLoopItem>(),
    read: new Set<FrameLoopItem>(),
    update: new Set<FrameLoopItem>(),
    render: new Set<FrameLoopItem>(),
} as const;

const STEP_NAMES: (keyof typeof steps)[] = Object.keys(steps) as (keyof typeof steps)[];

function iterateCallbacks (callbacks: Set<FrameLoopItem>, time: number) {
    for (const item of callbacks.values()) {
        item.fn(time);
        if (!item.once) {
            callbacks.delete(item);
        }
    }
}

function runStep (index: number, time: number) {
    const callbacks = steps[STEP_NAMES[index]];

    iterateCallbacks(callbacks, time);

    if (index < STEP_NAMES.length - 1) {
        queueMicrotask(runStep.bind(null, index + 1, time));
    }
}

function tick () {
    requestAnimationFrame(tick);
    runStep(0, performance.now());
}

function addCallback (callbacks: Set<FrameLoopItem>, fn: FrameLoopCallback, once: boolean = false) {
    const item: FrameLoopItem = { fn, once };

    callbacks.add(item);

    if (!isTimerRunning) {
        isTimerRunning = true;
        queueMicrotask(tick);
    }

    return () => {
        callbacks.delete(item);
    }
}

export const read = addCallback.bind(null, steps.read);
export const setup = addCallback.bind(null, steps.setup);
export const update = addCallback.bind(null, steps.update);
export const render = addCallback.bind(null, steps.render);

export default {
    setup,
    read,
    update,
    render,
}