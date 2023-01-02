export interface IVector2 {
    readonly row: number;
    readonly col: number;
}

export class Vector2 implements IVector2 {
    readonly row: number
    readonly col: number

    static readonly ZERO: Vector2 = new Vector2(0, 0)

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    static fromIVector2(vector: IVector2) {
        return new Vector2(vector.row, vector.col)
    }

    isZero(): boolean {
        return this.equals(Vector2.ZERO)
    }

    length(): number {
        return getVectorLength(this)
    }

    angle(): number {
        return vector2ToAngle(this)
    }

    rotate(angle: number): Vector2 {
        return Vector2.fromIVector2(rotateVector2(this, angle))
    }

    toLength(length: number): Vector2 {
        return Vector2.fromIVector2(vector2ToLength(this, length))
    }

    scale(amount: number): Vector2 {
        return Vector2.fromIVector2(scaleVector2(this, amount))
    }

    alterToCol(col: number): Vector2 {
        return Vector2.fromIVector2(vector2AlterToCol(this, col))
    }

    alterToRow(row: number): Vector2 {
        return Vector2.fromIVector2(vector2AlterToRow(this, row));
    }

    normalize(): Vector2 {
        return Vector2.fromIVector2(vector2Normalized(this))
    }

    toString(): string {
        return vector2ToString(this)
    }

    translate(row: number, col: number): Vector2 {
        return Vector2.fromIVector2(translateVector2(this, row, col))
    }

    int(): Vector2 {
        return Vector2.fromIVector2(vector2Int(this))
    }

    add(other: IVector2): Vector2 {
        return Vector2.fromIVector2(addVector2(this, other))
    }

    subtract(other: IVector2): Vector2 {
        return Vector2.fromIVector2(subtractVector2(this, other))
    }

    round(): Vector2 {
        return Vector2.fromIVector2(roundVector2(this))
    }

    distance(other: IVector2): number {
        return distanceBetweenVector2(this, other)
    }

    midpoint(other: IVector2): Vector2 {
        return Vector2.fromIVector2(midPointBetweenVector2(this, other))
    }

    angleBetween(other: IVector2): number {
        return angleBetweenVector2(this, other)
    }

    dot(other: IVector2): number {
        return dotProductVector2(this, other)
    }

    lerp(t: number, other: IVector2): Vector2 {
        return Vector2.fromIVector2(lerp(t, this, other))
    }

    adjacent(): [Vector2, Vector2, Vector2, Vector2] {
        return adjacentVector2(this).map(vec => Vector2.fromIVector2(vec)) as [Vector2, Vector2, Vector2, Vector2]
    }

    equals(other: any): boolean {
        if (typeof(other) === "object") {
            if ("row" in other && "col" in other) {
                return vector2Equals(this, other)
            }
        }
        return false
    }
}

export class LineSegment implements ILineSegment {
    readonly start: Vector2;
    readonly end: Vector2

    constructor(start: IVector2, end: IVector2) {
        this.start = Vector2.fromIVector2(start)
        this.end = Vector2.fromIVector2(end)
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


export function adjacentVector2(vec: IVector2): [IVector2, IVector2, IVector2, IVector2] {
    const offsets: [IVector2, IVector2, IVector2, IVector2] = [ {row: 0, col: 1}, {row: 0, col: -1}, {row: 1, col: 0}, {row: -1, col: 0} ]
    return offsets.map(offset => addVector2(vec, offset)) as [IVector2, IVector2, IVector2, IVector2]
}


export function getVectorLength(vector2: IVector2): number {
    return Math.sqrt(vector2.row * vector2.row + vector2.col * vector2.col);
}

export function rotateVector2(vector: IVector2, angleInRadians: number): IVector2 {
    const newCol: number = vector.col * Math.cos(angleInRadians) + vector.row * Math.sin(angleInRadians);
    const newRow: number = -vector.col * Math.sin(angleInRadians) + vector.row * Math.cos(angleInRadians);
    return { row: newRow, col: newCol  };
}

export function vector2ToLength(vector: IVector2, length: number): IVector2 {
    if (vector.row === 0 && vector.col === 0) {
        console.error('cannot change length of 0 length vector');
    }

    return scaleVector2(vector,  length /  getVectorLength(vector));
}

export function vector2ToAngle(vector: IVector2): number {
    return Math.atan2(-vector.row, vector.col);
}

export function vector2AlterToCol(vector: IVector2, col: number): IVector2 {
    const factor: number = col / vector.col;
    return scaleVector2(vector, factor);
}

export function vector2AlterToRow(vector: IVector2, row: number): IVector2 {
    const factor: number = row / vector.row;
    return scaleVector2(vector, factor);
}

export function vector2Normalized(vector: IVector2): IVector2 {
    return vector2ToLength(vector, 1);
}

export function vector2ToString(vector: IVector2): string {
    return `IVector2: [ Row: ${vector.row}, Col: ${vector.col} Angle: ${ vector2ToAngle(vector) * 180.0 / Math.PI }]`
}

export function translateVector2(vector: IVector2, row: number, col: number): IVector2 { 
    return { row: vector.row + row, col: vector.col + col };
}

export function addVector2(vector: IVector2, other: IVector2): IVector2 {
    return { row: vector.row + other.row, col: vector.col + other.col }
}

export function vector2Int(vector: IVector2): IVector2 {
    return { row: Math.trunc(vector.row), col: Math.trunc(vector.col) }
}

export function subtractVector2(vector: IVector2, other: IVector2): IVector2 {
    return { row: vector.row - other.row, col: vector.col - other.col }
}

export function scaleVector2(vector: IVector2, scale: number): IVector2 {
    return { row: vector.row * scale, col: vector.col * scale }
}

export function roundVector2(vector: IVector2): IVector2 {
    return { row: Math.round(vector.row), col: Math.round(vector.col) }
}

export function vector2FromAngle(angleInRadians: number): IVector2 {
    return { row: -Math.sin(angleInRadians), col: Math.cos(angleInRadians) };
}

export function distanceBetweenVector2(first: IVector2, second: IVector2): number {
    return Math.sqrt( ( first.row - second.row ) * ( first.row - second.row ) + ( first.col - second.col ) * (first.col - second.col) );
}

export function midPointBetweenVector2(first: IVector2, second: IVector2): IVector2 {
   return { row: ( first.row + second.row ) / 2, col:  (first.col + second.col) / 2 }
} 

export function angleBetweenVector2(first: IVector2, second: IVector2): number {
    return Math.abs( vector2ToAngle(first) - vector2ToAngle(second));
}

export function dotProductVector2(first: IVector2, second: IVector2): number {
    const angle: number = angleBetweenVector2(first, second);
    return getVectorLength(first) * getVectorLength(second) * Math.cos(angle);
}

export function vector2Equals(vector: IVector2, other: IVector2): boolean {
    return vector.row == other.row && vector.col === other.col
}

export function lerp(t: number, first: IVector2, second: IVector2): IVector2 {
    return addVector2(first, scaleVector2( subtractVector2(second, first), t))
}