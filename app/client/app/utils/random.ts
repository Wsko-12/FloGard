export default class Random {
    m = 4294967296;
    a = 1664525;
    c = 1013904223;
    x: number;
    constructor(seed: number) {
        this.x = seed;
    }

    get() {
        const { x, m, a, c } = this;
        this.x = (a * x + c) % m;
        return this.x / m;
    }
}
