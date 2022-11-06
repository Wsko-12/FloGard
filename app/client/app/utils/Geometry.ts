const NUM_PREC = 4;

export function roundNum(num: number, precision = NUM_PREC): number {
    return Math.round(num * 10 ** precision) / 10 ** precision;
}

export class Point2 {
    public x: number;
    public y: number;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    getDistanceTo(x?: Point3 | Point2 | number, y?: number): number {
        if (x instanceof Point2 || x instanceof Point3) {
            return roundNum(Math.sqrt((this.x - x.x) ** 2 + (this.y - x.y) ** 2));
        }
        if (!x && !y) {
            return this.getDistanceTo(new Point2(0, 0));
        }
        if (typeof x === 'number' && typeof y === 'number') {
            return this.getDistanceTo(new Point2(x, y));
        }
        return 0;
    }

    public getCirclePoint(angle: number, radius = 1) {
        return new Point2(this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius);
    }

    getCordsArr(): [number, number] {
        return [this.x, this.y];
    }
}

export class Point3 {
    public x: number;
    public y: number;
    public z: number;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getDistanceTo(x?: Point3 | Point2 | number, y?: number, z?: number): number {
        if (x instanceof Point3) {
            return roundNum(Math.sqrt((this.x - x.x) ** 2 + (this.y - x.y) ** 2 + (this.z - x.z) ** 2));
        }

        if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            return this.getDistanceTo(new Point3(x, y, z));
        } else if (typeof x === 'number' && typeof y === 'number' && !z) {
            return this.getDistanceTo(new Point3(x, y, this.z));
        } else if (typeof x === 'number' && !y && !z) {
            return this.getDistanceTo(new Point3(x, this.y, this.z));
        } else if (x instanceof Point2) {
            return this.getDistanceTo(new Point3(x.x, x.y, this.z));
        } else if (!x && !y && !z) {
            return this.getDistanceTo(new Point3(0, 0, 0));
        }
        return 0;
    }

    getCordsArr(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}

export class Vector2 {
    public x: number;
    public y: number;
    public length: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.length = this.getLength();
    }

    public getLength(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    public normalize(): Vector2 {
        if (this.x === 0 && this.y === 0) return this;
        const length = this.getLength();
        this.x /= length;
        this.y /= length;
        this.length = this.getLength();
        return this;
    }

    public scale(scalar: number): Vector2 {
        this.x *= scalar;
        this.y *= scalar;
        this.length = this.getLength();
        return this;
    }

    public movePoint(point: Point2) {
        point.x += this.x;
        point.y += this.y;
        return point;
    }

    public getPerpendicularVector(): Vector2 {
        if (this.x === 0) {
            return new Vector2(this.y, 0);
        }
        if (this.y === 0) {
            return new Vector2(0, this.x);
        }
        return new Vector2(-this.y, this.x);
    }

    public addVector(vec: Vector2): Vector2 {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    public dot(vec: Vector2) {
        return (this.x / this.length) * vec.x + this.y / this.length + vec.y;
    }
}

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;
    public length: number;

    constructor(x: number | Point3, y: number, z: number) {
        if (x instanceof Point3) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        this.length = this.getLength();
    }

    public getLength(): number {
        return roundNum(Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2));
    }

    public normalize(): Vector3 {
        if (this.x === 0 && this.y === 0 && this.z === 0) return this;
        const length = this.getLength();
        this.x = roundNum(this.x / length);
        this.y = roundNum(this.y / length);
        this.z = roundNum(this.z / length);
        this.length = this.getLength();
        return this;
    }

    public scale(scalar: number): Vector3 {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.length = this.getLength();
        return this;
    }
}
