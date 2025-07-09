let timerRunning = false;
let time = 0;

type FrameLoopCallback = (time: number) => any;

type FrameLoopItem = {
    fn: FrameLoopCallback,
    keepAlive: boolean,
}

const resetCallbacks: Set<FrameLoopItem> = new Set();
const readCallbacks: Set<FrameLoopItem> = new Set();
const updateCallbacks: Set<FrameLoopItem> = new Set();
const renderCallbacks: Set<FrameLoopItem> = new Set();

function iterateCallbacks (callbacks: Set<FrameLoopItem>, time: number) {
    for (const item of callbacks.values()) {
        item.fn(time);
        if (!item.keepAlive) {
            callbacks.delete(item);
        }
    }
}

function resetStep () {
    iterateCallbacks(resetCallbacks, time);
    queueMicrotask(readStep);
}
function readStep() {
    iterateCallbacks(readCallbacks, time);
    queueMicrotask(updateStep);
}
function updateStep() {
    iterateCallbacks(updateCallbacks, time);
    queueMicrotask(renderStep);
}
function renderStep() {
    iterateCallbacks(renderCallbacks, time);
}

function tick () {
    requestAnimationFrame(tick);
    time = performance.now();
    resetStep();
}

function addCallback (callbacks: Set<FrameLoopItem>, fn: FrameLoopCallback, keepAlive: boolean = false) {
    const item: FrameLoopItem = { fn, keepAlive };

    callbacks.add(item);

    if (!timerRunning) {
        timerRunning = true;
        queueMicrotask(tick);
    }

    return () => {
        callbacks.delete(item);
    }
}

export const read = addCallback.bind(null, readCallbacks);
export const reset = addCallback.bind(null, resetCallbacks);
export const update = addCallback.bind(null, updateCallbacks);
export const render = addCallback.bind(null, renderCallbacks);

export default {
    reset,
    read,
    update,
    render,
}