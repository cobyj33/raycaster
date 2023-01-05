import { getLine } from "functions/shape";
import { IVector2, Vector2 } from "interfaces/Vector2"

export class LineSegment implements ILineSegment {
    readonly start: Vector2;
    readonly end: Vector2

    constructor(start: IVector2, end: IVector2) {
        this.start = Vector2.fromIVector2(start)
        this.end = Vector2.fromIVector2(end)
    }

    static getCells(start: IVector2, end: IVector2): IVector2[] {
        return new LineSegment(start, end).cells()
    }

    cells(): IVector2[] {
        return getLine(this.start, this.end)
    }

    length(): number {
        return this.start.distance(this.end)
    }
    
    transform(callbackfn: (vec: Vector2) => Vector2): LineSegment {
        return new LineSegment(callbackfn(this.start), callbackfn(this.end))
    }
}

export interface ILineSegment {
    start: IVector2;
    end: IVector2;
}
