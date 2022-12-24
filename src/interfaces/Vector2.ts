export interface Vector2 {
    readonly row: number;
    readonly col: number;
}

export interface LineSegment {
    start: Vector2;
    end: Vector2;
}


export function getVectorLength(vector2: Vector2): number {
    return Math.sqrt(vector2.row * vector2.row + vector2.col * vector2.col);
}

export function rotateVector2(vector: Vector2, angleInRadians: number): Vector2 {
    const newCol: number = vector.col * Math.cos(angleInRadians) + vector.row * Math.sin(angleInRadians);
    const newRow: number = -vector.col * Math.sin(angleInRadians) + vector.row * Math.cos(angleInRadians);
    return { row: newRow, col: newCol  };
}

export function vector2ToLength(vector: Vector2, length: number): Vector2 {
    if (vector.row === 0 && vector.col === 0) {
        console.error('cannot change length of 0 length vector');
    }

    return scaleVector2(vector,  length /  getVectorLength(vector));
}

export function vector2ToAngle(vector: Vector2): number {
    return Math.atan2(-vector.row, vector.col);
}

export function vector2AlterToCol(vector: Vector2, col: number): Vector2 {
    const factor: number = col / vector.col;
    return scaleVector2(vector, factor);
}

export function vector2AlterToRow(vector: Vector2, row: number): Vector2 {
    const factor: number = row / vector.row;
    return scaleVector2(vector, factor);
}

export function vector2Normalized(vector: Vector2): Vector2 {
    return vector2ToLength(vector, 1);
}

export function toString(vector: Vector2): string {
    return `Vector2: [ Row: ${vector.row}, Col: ${vector.col} Angle: ${ vector2ToAngle(vector) * 180.0 / Math.PI }]`
}

export function translateVector2(vector: Vector2, row: number, col: number): Vector2 { 
    return { row: vector.row + row, col: vector.col + col };
}

export function addVector2(vector: Vector2, other: Vector2): Vector2 {
    return { row: vector.row + other.row, col: vector.col + other.col }
}

export function vector2Int(vector: Vector2): Vector2 {
    return { row: Math.trunc(vector.row), col: Math.trunc(vector.col) }
}

export function subtractVector2(vector: Vector2, other: Vector2): Vector2 {
    return { row: vector.row - other.row, col: vector.col - other.col }
}

export function scaleVector2(vector: Vector2, scale: number): Vector2 {
    return { row: vector.row * scale, col: vector.col * scale }
}

export function roundVector2(vector: Vector2): Vector2 {
    return { row: Math.round(vector.row), col: Math.round(vector.col) }
}

export function vector2FromAngle(angleInRadians: number): Vector2 {
    return { row: -Math.sin(angleInRadians), col: Math.cos(angleInRadians) };
}

export function distanceBetweenVector2(first: Vector2, second: Vector2): number {
    return Math.sqrt( ( first.row - second.row ) * ( first.row - second.row ) + ( first.col - second.col ) * (first.col - second.col) );
}

export function midPointBetweenVector2(first: Vector2, second: Vector2): Vector2 {
   return { row: ( first.row + second.row ) / 2, col:  (first.col + second.col) / 2 }
} 

export function angleBetweenVector2(first: Vector2, second: Vector2): number {
    return Math.abs( vector2ToAngle(first) - vector2ToAngle(second));
}

export function dotProductVector2(first: Vector2, second: Vector2): number {
    const angle: number = angleBetweenVector2(first, second);
    return getVectorLength(first) * getVectorLength(second) * Math.cos(angle);
}

export function vector2Equals(vector: Vector2, other: Vector2): boolean {
    return vector.row == other.row && vector.col === other.col
}
