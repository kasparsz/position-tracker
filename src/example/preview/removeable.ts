export function removeable (element: HTMLElement, clickHandler: () => void) {
    const removeButton = document.createElement('button');
    removeButton.innerText = 'x';
    removeButton.className = 'box-list__box-remove';
    element.appendChild(removeButton);

    const textElement = document.createElement('span');
    element.appendChild(textElement);

    removeButton.addEventListener('click', clickHandler);
}