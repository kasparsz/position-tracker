import { track } from '../tracker';
import { draggable } from './preview/draggable';
import { highlighter } from './preview/highlighter';

import { signal, effect } from 'alien-signals';

function trackWindowElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);
    const tracker = track(element, window);

    effect(() => {
        highlight.highlight();
        (element as HTMLElement).innerText = `window\n${tracker.relativePosition.left().toFixed(0)} x ${tracker.relativePosition.top().toFixed(0)}`;
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
        (element as HTMLElement).innerText = `body\n${tracker.relativePosition.left().toFixed(0)} x ${tracker.relativePosition.top().toFixed(0)}`;
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
        // update () {
        //     this.position.left += Math.random() >= 0.5 ? 1 : -1;
        // }
    };

    // setInterval(() => {
    //     virtualTracker.position.left = virtualTracker.position.left + Math.random() * 5;
    //     virtualTracker.position.top = virtualTracker.position.top + Math.random() * 5;
    // }, 1000);

    const tracker = track(element, virtualTracker);
    
    effect(() => {
        (element as HTMLElement).innerText = `virtual\n${tracker.relativePosition.left().toFixed(0)} x ${tracker.relativePosition.top().toFixed(0)}`;
        highlight.highlight();
    });

    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

function trackVirtualSignalElementWithDraggable (element: HTMLElement) {
    const highlight = highlighter(element);
    const virtualTracker = {
        position: {
            left: signal(50),
            top: signal(50),
            right: signal(50),
            bottom: signal(50),
        },
        // update () {
        //     this.position.left(this.position.left() + (Math.random() >= 0.5 ? 1 : -1));
        // }
    };

    // setInterval(() => {
    //     virtualTracker.position.left(virtualTracker.position.left() + Math.random() * 5);
    //     virtualTracker.position.top(virtualTracker.position.top() + Math.random() * 5);
    // }, 1000);

    const tracker = track(element, virtualTracker);
    
    effect(() => {
        (element as HTMLElement).innerText = `virtual signal\n${tracker.relativePosition.left().toFixed(0)} x ${tracker.relativePosition.top().toFixed(0)}`;
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
        (elements[0] as HTMLElement).innerText = `relative\n${trackerA.relativePosition.left().toFixed(0)} x ${trackerA.relativePosition.top().toFixed(0)}`;
    });

    effect(() => {
        highlights[1].highlight();
        (elements[1] as HTMLElement).innerText = `relative\n${trackerB.relativePosition.left().toFixed(0)} x ${trackerB.relativePosition.top().toFixed(0)}`;
    });
}

function draggableElement (element: HTMLElement) {
    draggable(element, (position: { x: number, y: number }) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    });
}

document.querySelectorAll('.box-list__box-sticky, .box-list__box-viewport').forEach((el) => trackWindowElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-virtual').forEach((el) => trackVirtualElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-virtual-signal').forEach((el) => trackVirtualSignalElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box:not(.box-list__box-line, .box-list__box-sticky, .box-list__box-viewport, .box-list__box-virtual, .box-list__box-virtual-signal, .box-list__box-virtual-box-preview, .box-list__box-relative)').forEach((el) => trackDocumentElementWithDraggable(el as HTMLElement));
document.querySelectorAll('.box-list__box-line').forEach((el) => draggableElement(el as HTMLElement));

trackRelativeElementWithDraggable(Array.from(document.querySelectorAll('.box-list__box-relative')) as HTMLElement[]);

// trackDocumentElementWithDraggable(document.querySelector('.box-list__box:not(.box-list__box-sticky, .box-list__box-viewport)'));
