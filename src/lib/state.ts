import { writable } from 'svelte/store';

export const figurePosition = writable<{
    xAxisValue: number;
    yAxisValue: number;
    zAxisValue: number;
}>({ xAxisValue: 0, yAxisValue: 0, zAxisValue: 0 });
export const figureColor = writable<string>('#fff');
export const figureDetails = writable<Record<string, boolean>>({});
export const figureRotation = writable<{ x: number; y: number; z: number; }>({ x: 0, y: 0, z: 0 });
export const renderSettings = writable<{ framePerAxis: number }>({ framePerAxis: 2 });