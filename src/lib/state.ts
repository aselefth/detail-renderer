import { writable } from 'svelte/store';

export const figurePosition = writable<{
    xAxisValue: number;
    yAxisValue: number;
    zAxisValue: number;
}>({ xAxisValue: -9, yAxisValue: -59, zAxisValue: -12 });
export const figureColor = writable<string>('#fff');
