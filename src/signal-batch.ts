import { startBatch, endBatch } from 'alien-signals';
import { config } from './config';

// Count of trackers, we add batching when first tracker is added and remove it when last tracker is removed
let trackerCount = 0;
let removeReadListener = () => {};
let removeUpdateListener = () => {};

/**
 * Called when a tracker is added
 * Adds the read and update listeners to the frame loop to batch signal calls which prevents
 * layout thrashing
 */
function addedTracker () {
    if (!trackerCount) {
        removeReadListener = config.frameLoop.read(() => {
            startBatch();
        });
        removeUpdateListener = config.frameLoop.update(() => {
            endBatch();
        });
    }

    trackerCount++;
}

/**
 * Called when a tracker is removed
 * Removes the read and update listeners from the frame loop
 */
function removedTracker () {
    trackerCount--;

    if (!trackerCount) {
        removeReadListener();
        removeUpdateListener();
    }
}

export { addedTracker, removedTracker };