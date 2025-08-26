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
            left: 50,
            top: 50,
            right: 50,
            bottom: 50,
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

function trackRelativeElementWithDraggable (elements: HTMLElement[]) {
    const highlights = elements.map(element => highlighter(element));

    // trackDocumentElementWithDraggable(target);

    elements.forEach((element) => {
        draggable(element, (position: { x: number, y: number }) => {
            element.style.transform = `translate(${position.x}px, ${position.y}px)`;
        });
    });

    track(elements[0], elements[1]).on(({ relativePosition, element }) => {
        highlights[0].highlight();
        (element as HTMLElement).innerText = `relative\n${relativePosition.left.toFixed(0)} x ${relativePosition.top.toFixed(0)}`;
    });

    track(elements[1], elements[2]).on(({ relativePosition, element }) => {
        highlights[1].highlight();
        (element as HTMLElement).innerText = `relative\n${relativePosition.left.toFixed(0)} x ${relativePosition.top.toFixed(0)}`;
    });
}

function draggableElement (element: HTMLElement) {
    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

document.querySelectorAll('.box-list__box-sticky, .box-list__box-viewport').forEach((el) => trackWindowElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-virtual').forEach((el) => trackVirtualElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box:not(.box-list__box-line, .box-list__box-sticky, .box-list__box-viewport, .box-list__box-virtual, .box-list__box-virtual-box-preview, .box-list__box-relative)').forEach((el) => trackDocumentElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-line').forEach((el) => draggableElement(el as HTMLElement));

trackRelativeElementWithDraggable(Array.from(document.querySelectorAll('.box-list__box-relative')) as HTMLElement[]);

// trackDocumentElementWithDraggable(document.querySelector('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport)'));
