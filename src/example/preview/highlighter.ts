import { debounce } from '../../utils/debounce';

export function highlighter (element: HTMLElement) {
    // Highlight the element
    const unhighlight = debounce(() => {
        element.classList.remove('highlight');
    }, 1000);

    return {
        highlight() {
            element.classList.add('highlight');
            unhighlight();
        }
    };
}