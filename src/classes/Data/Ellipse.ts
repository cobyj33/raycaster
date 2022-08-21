import { removeDuplicates } from "../../functions/utilityFunctions";
import { Vector2 } from "./Vector2";
import { LineSegment } from "./LineSegment"

export class Ellipse {
    readonly start: Vector2;
    readonly end: Vector2;
    private _cells: Vector2[] = [];
    get cells(): Vector2[] {
        if (this._cells.length > 0) {
            return this._cells;
        }
        this._cells = this.getEllipse(this.start, this.end);
        return this._cells;
    }

    constructor(first: Vector2, second: Vector2) {
        this.start = first.clone();
        this.end = second.clone();
    }

    private getEllipse(firstPoint: Vector2, secondPoint: Vector2): Vector2[] {
        if (firstPoint.equals(secondPoint)) { return []; }
        const {row: row1, col: col1} = firstPoint;
        const {row: row2, col: col2} = secondPoint;
        const centerCol: number = (col1 + col2) / 2
        const centerRow: number = (row1 + row2 ) / 2
        const horizontalRadius: number = Math.abs(col1 - col2) / 2;
        const verticalRadius: number = Math.abs(row1 - row2) / 2;
        const intersections: Vector2[] = []

        if (col1 == col2 || row1 == row2) {
            return new LineSegment(firstPoint, secondPoint).toCells();
        }
       
        for (let col = Math.min(firstPoint.col, secondPoint.col); col <= Math.max(firstPoint.col, secondPoint.col); col += 1) {
            const evaluation: number = Math.sqrt(Math.pow(verticalRadius, 2) * (1  - (Math.pow(col - centerCol, 2) / Math.pow(horizontalRadius, 2) ) ))
            intersections.push(new Vector2(Math.floor(centerRow + evaluation), Math.floor(col)));
            intersections.push(new Vector2(Math.floor(centerRow - evaluation), Math.floor(col)));
        } 
    
        for (let row = Math.min(firstPoint.row, secondPoint.row); row <= Math.max(firstPoint.row, secondPoint.row); row += 1) {
            const evaluation: number = Math.sqrt(Math.pow(horizontalRadius, 2) * (1  - (Math.pow(row - centerRow, 2) / Math.pow(verticalRadius, 2) ) ))
            intersections.push(new Vector2(Math.floor(row), Math.floor(centerCol + evaluation)));
            intersections.push(new Vector2(Math.floor(row), Math.floor(centerCol - evaluation)));
        } 
        
        return removeDuplicates(intersections)
    }

}
