import { type Tracker } from '../../tracker';
import { type TrackerSizeSignal } from '../../tracker-size';
import { type TrackerPositionSignal, type TrackerPosition } from '../../tracker-position';
import { effect } from 'alien-signals';
import { unSignal } from '../../signal';

function getClosestPointOnRectangle(rectangleA: { left: number, top: number, width: number, height: number }, point: { left: number, top: number }) {
    return {
        left: Math.max(rectangleA.left, Math.min(point.left, rectangleA.left + rectangleA.width)),
        top: Math.max(rectangleA.top, Math.min(point.top, rectangleA.top + rectangleA.height)),
    };
}

function normalizePosition(position: TrackerPositionSignal|TrackerPosition) {
    return {
        left: unSignal(position.left),
        top: unSignal(position.top),
    }
}
function normalizeSize(size: TrackerSizeSignal|null) {
    return size ? {
        width: unSignal(size.width),
        height: unSignal(size.height),
    } : {
        width: 0,
        height: 0,
    };
}

export function line(tracker:Tracker) {
    const line = document.createElement('div');
    line.style.position = 'fixed';
    line.style.left = '0';
    line.style.top = '0';
    line.style.width = '0';
    line.style.height = '0';
    line.style.borderTop = '1px solid red';
    line.style.pointerEvents = 'none';
    line.style.transformOrigin = 'left top';
    document.body.appendChild(line);

    effect(() => {
        if (tracker.relative) {
            const sPosition = normalizePosition(tracker.position);
            const sSize = normalizeSize(tracker.size);
            const sCenterPoint = { left: (sPosition.left + sSize.width / 2), top: (sPosition.top + sSize.height / 2) };
    
            const tPosition = normalizePosition(tracker.relative.position);
            const tSize = normalizeSize('size' in tracker.relative ? tracker.relative.size : null);

            const tCenterPoint = { left: (tPosition.left + tSize.width / 2), top: (tPosition.top + tSize.height / 2) };
    
            const cPoint = { left: (tCenterPoint.left + sCenterPoint.left) / 2, top: (tCenterPoint.top + sCenterPoint.top) / 2 };
    
            const closestSPoint = getClosestPointOnRectangle({ left: sPosition.left, top: sPosition.top, width: sSize.width, height: sSize.height }, cPoint);
            const closestTPoint = getClosestPointOnRectangle({ left: tPosition.left, top: tPosition.top, width: tSize.width, height: tSize.height }, cPoint);
    
            const width = (closestTPoint.left - closestSPoint.left);
            const height = (closestTPoint.top - closestSPoint.top);
    
            line.style.transform = `translate(${closestSPoint.left}px, ${closestSPoint.top}px) rotate(${Math.atan2(height, width)}rad)`;
            line.style.width = `${Math.sqrt(width * width + height * height)}px`;
        }
    });
}