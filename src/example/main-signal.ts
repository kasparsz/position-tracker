import { track } from '../index';
import { draggable } from './preview/draggable';
import { highlighter } from './preview/highlighter';

import { effect } from 'alien-signals';

function trackWindowElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);
    const tracker = track(element, window);

    effect(() => {
        highlight.highlight();
        (element as HTMLElement).innerText = `window\n${tracker.relativePosition.leftSignal?.().toFixed(0)} x ${tracker.relativePosition.topSignal?.().toFixed(0)}`;
    });

    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

function trackDocumentElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);
    const tracker = track(element, document);

    draggable(element, (position: { x: number, y: number }) => {
        if (element.style) element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });

    effect(() => {
        highlight.highlight();
        (element as HTMLElement).innerText = `body\n${tracker.relativePosition.leftSignal?.().toFixed(0)} x ${tracker.relativePosition.topSignal?.().toFixed(0)}`;
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
    };

    const tracker = track(element, virtualTracker);
    
    effect(() => {
        (element as HTMLElement).innerText = `virtual\n${tracker.relativePosition.leftSignal?.().toFixed(0)} x ${tracker.relativePosition.topSignal?.().toFixed(0)}`;
        highlight.highlight();
    });

    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

function trackRelativeElementWithDraggable (elements: HTMLElement[]) {
    const highlights = elements.map(element => highlighter(element));
    const trackerA = track(elements[0], elements[1]);
    const trackerB = track(elements[1], elements[2]);

    // trackDocumentElementWithDraggable(target);

    elements.forEach((element) => {
        draggable(element, (position: { x: number, y: number }) => {
            element.style.transform = `translate(${position.x}px, ${position.y}px)`;
        });
    });

    effect(() => {
        highlights[0].highlight();
        (elements[0] as HTMLElement).innerText = `relative\n${trackerA.relativePosition.leftSignal?.().toFixed(0)} x ${trackerA.relativePosition.topSignal?.().toFixed(0)}`;
    });

    effect(() => {
        highlights[1].highlight();
        (elements[1] as HTMLElement).innerText = `relative\n${trackerB.relativePosition.leftSignal?.().toFixed(0)} x ${trackerB.relativePosition.topSignal?.().toFixed(0)}`;
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
