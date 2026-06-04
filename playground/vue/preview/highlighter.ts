import { debounce } from '../utils/debounce';
import { type Ref } from 'vue';

export function useHighlighter (element: Ref<HTMLElement | null>) {
    // Highlight the element
    const unhighlight = debounce(() => {
        element.value?.classList.remove('highlight');
    }, 1000);

    return {
        highlight() {
            element.value?.classList.add('highlight');
            unhighlight();
        }
    };
}