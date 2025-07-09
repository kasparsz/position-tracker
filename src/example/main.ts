import { track } from '../index';
import { draggable } from './preview/draggable';
import { highlighter } from './preview/highlighter';


function trackWindowElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);

    track(element, window).on(({ relativePosition, element }) => {
        // console.log(relativePosition, element);
        highlight.highlight();
        (element as HTMLElement).innerText = `window\n${relativePosition.left.toFixed(0)} x ${relativePosition.top.toFixed(0)}`;
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

    track(element, document).on(({ relativePosition, element }) => {
        // console.log(position, relativePosition, element);
        (element as HTMLElement).innerText = `body\n${relativePosition.left.toFixed(0)} x ${relativePosition.top.toFixed(0)}`;
        highlight.highlight();
    });
}

function trackVirtualElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);
    const virtualTracker = {
        position: {
            left: 0,
            top: 0,
            right: 100,
            bottom: 100,
        },
    }
    track(element, virtualTracker).on(({ relativePosition, element }) => {
        // console.log(relativePosition, element);
        (element as HTMLElement).innerText = `virtual\n${relativePosition.left.toFixed(0)} x ${relativePosition.top.toFixed(0)}`;
        highlight.highlight();
    });

    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

document.querySelectorAll('.box-list__box-sticky, .box-list__box-viewport').forEach((el) => trackWindowElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-virtual').forEach((el) => trackVirtualElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport, .box-list__box-virtual)').forEach((el) => trackDocumentElementWithDraggable(el as HTMLElement));

// trackDocumentElementWithDraggable(document.querySelector('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport)'));
