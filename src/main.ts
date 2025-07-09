import { track } from './index';
import { draggable } from './preview/draggable';
import { highlighter } from './preview/highlighter';

function trackWindowElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);

    track(element, window).on(({ relativePosition, element }) => {
        console.log(relativePosition, element);
        highlight.highlight();
    });

    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}


function trackDocumentElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);

    draggable(element, (position: { x: number, y: number }) => {
        if (element.style) element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });

    track(element, document).on(({ position, relativePosition, element }) => {
        console.log(position, relativePosition, element);
        highlight.highlight();
    });
}

document.querySelectorAll('.box-list__box-sticky, .box-list__box-viewport').forEach((el) => trackWindowElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport)').forEach((el) => trackDocumentElementWithDraggable(el as HTMLElement));

// trackDocumentElementWithDraggable(document.querySelector('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport)'));
