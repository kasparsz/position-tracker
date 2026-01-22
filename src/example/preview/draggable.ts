import { frame } from '../../index';

export function draggable (element: HTMLElement, callback: (position: { x: number, y: number }) => void) {
    const accumulatedPosition = { x: 0, y: 0 };
    const startPosition = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    const destroyAbortController = new AbortController();
    let abortController: AbortController | null = null;

    function onDragStop () {
        abortController?.abort();
        abortController = null;
        accumulatedPosition.x += position.x;
        accumulatedPosition.y += position.y;
    }
    function onDrag (event: PointerEvent) {
        position.x = event.clientX - startPosition.x;
        position.y = event.clientY - startPosition.y;

        const eventX = accumulatedPosition.x + position.x;
        const eventY = accumulatedPosition.y + position.y;

        frame.update(() => {
            callback({ x: eventX, y: eventY });
        }, true);
    }

    element.draggable = false;

    element.addEventListener('pointerdown', (event: PointerEvent) => {
        if (event.defaultPrevented) return;

        abortController?.abort();

        abortController = new AbortController();
        startPosition.x = event.clientX;
        startPosition.y = event.clientY;
        
        document.addEventListener('pointerup', onDragStop, { signal: abortController.signal });
        document.addEventListener('pointercancel', onDragStop, { signal: abortController.signal });
        document.addEventListener('pointermove', onDrag, { signal: abortController.signal });

        event.preventDefault();
    }, { signal: destroyAbortController.signal });

    return function () {
        destroyAbortController.abort();
    };
}