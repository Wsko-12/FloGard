import { RGBArr } from '../../../ts/types';

export const memoize = <I, R>(fn: (input: I) => R) => {
    const memoMap = new Map<I, R>();
    return (input: I): R => {
        if (memoMap.has(input)) {
            return memoMap.get(input) as R;
        }

        const result = fn(input);
        memoMap.set(input, result);
        return result;
    };
};

export const interpolate = (v1: number, v2: number, a: number) => {
    return v1 * (1 - a) + v2 * a;
};

export const interpolateColor = (color1: RGBArr, color2: RGBArr, value: number) => {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;

    const r0 = Math.floor(interpolate(r1, r2, value));
    const g0 = Math.floor(interpolate(g1, g2, value));
    const b0 = Math.floor(interpolate(b1, b2, value));
    return [r0, g0, b0];
};

export const getColorByDayTime = (colorsArr: RGBArr[], currentTime: number, fullDayTime: number) => {
    const value = currentTime / fullDayTime;

    const { length } = colorsArr;

    const preIndex = length * value;

    const index = Math.floor(preIndex);
    const nextIndex = (index + 1) % length;

    const currentColor = colorsArr[index];
    const nextColor = colorsArr[nextIndex];

    const interpolationValue = preIndex - index;

    const color = interpolateColor(currentColor, nextColor, interpolationValue);

    return `rgb(${color.join()})`;
};
