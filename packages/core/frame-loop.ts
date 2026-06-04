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
};

/**
 * List of steps with a set of callback items
 */
const steps = {
    setup: new Set<FrameLoopItem>(),
    read: new Set<FrameLoopItem>(),
    update: new Set<FrameLoopItem>(),
    render: new Set<FrameLoopItem>(),
} as const;

const STEP_NAMES: (keyof typeof steps)[] = Object.keys(steps) as (keyof typeof steps)[];

/**
 * Executes all callbacks in a given step
 * @param callbacks - Set of callback items to execute
 * @param time - Current timestamp from requestAnimationFrame
 */
function iterateCallbacks (callbacks: Set<FrameLoopItem>, time: number) {
    for (const item of callbacks.values()) {
        item.fn(time);
        if (item.once) {
            callbacks.delete(item);
        }
    }
}

/**
 * Runs a given step and schedules the next step
 * @param index - Index of the step to run
 * @param time - Current timestamp from requestAnimationFrame
 */
function runStep (index: number, time: number) {
    const markStart = performance.now();
    const callbacks = steps[STEP_NAMES[index]];

    iterateCallbacks(callbacks, time);

    // Add timing marker in DevTools Performance panel
    // @ts-ignore
    console.timeStamp(STEP_NAMES[index], markStart, performance.now(), 'FrameLoop');

    if (index < STEP_NAMES.length - 1) {
        queueMicrotask(runStep.bind(null, index + 1, time));
    }
}

/**
 * Main tick function that runs the frame loop
 */
function tick () {
    runStep(0, performance.now());
    requestAnimationFrame(tick);
}

/**
 * Adds a callback to a given step
 * @param callbacks - Set of callback items to add to
 * @param fn - Callback function to add
 * @param once - Whether the callback should be executed only once
 */
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

/**
 * Adds a callback to the read step
 * @param fn - Callback function to add
 * @param once - Whether the callback should be executed only once
 */
export const read = addCallback.bind(null, steps.read);

/**
 * Adds a callback to the setup step
 * @param fn - Callback function to add
 * @param once - Whether the callback should be executed only once
 */
export const setup = addCallback.bind(null, steps.setup);

/**
 * Adds a callback to the update step
 * @param fn - Callback function to add
 * @param once - Whether the callback should be executed only once
 */
export const update = addCallback.bind(null, steps.update);

/**
 * Adds a callback to the render step
 * @param fn - Callback function to add
 * @param once - Whether the callback should be executed only once
 */
export const render = addCallback.bind(null, steps.render);

/**
 * Frame loop object
 */
export default {
    setup,
    read,
    update,
    render,
}