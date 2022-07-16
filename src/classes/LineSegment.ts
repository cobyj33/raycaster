import { Vector2 } from "./Vector2";

export class LineSegment {
    readonly start: Vector2;
    readonly end: Vector2;

    constructor(start: Vector2, end: Vector2) {
        this.start = start;
        this.end = end;
    }

    toString() {
        return `Line Segment: { start: ${this.start.toString()}, end: ${this.end.toString()}}`
    }
}