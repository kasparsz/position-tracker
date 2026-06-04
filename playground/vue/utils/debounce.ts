export function debounce (callback: (...args: any[]) => void, delay: number) {
    let timeout: number;

    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}