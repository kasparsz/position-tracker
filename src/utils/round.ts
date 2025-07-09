/**
 * Rounds a value to the nearest sub-pixel value
 * @param {number} value Value
 * @returns {number} Rounded value
 */
export function roundSubPixels (value: number): number {
    return Math.round(value * 10) / 10;
}
