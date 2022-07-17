import { removeDuplicates } from "../../functions/removeDuplicates";
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

    toCells(): Vector2[] {
        if (this.start.equals(this.end)) { return []; }
        const {row: row1, col: col1} = this.start;
        const {row: row2, col: col2} = this.end;
        const intersections: Vector2[] = []
    
        if (col1 === col2) {
            for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
                intersections.push(new Vector2(row, col1).int())
            }
        }
        else if (row1 === row2) {
            for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
                intersections.push(new Vector2(row1, col).int());
            }
        } else {
            const slope: number = (row1 - row2) / (col1 - col2)
            const yIntercept: number = row1 - (slope * col1);
            for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
                const row: number = (slope * col) + yIntercept;
                intersections.push(new Vector2(row, col).int());
            }
            for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
                const col: number = (row - yIntercept) / slope;
                intersections.push(new Vector2(row, col).int());
            }
        }   
        
        return removeDuplicates(intersections)
    }
}

// export function getLine(firstPoint: Selection, secondPoint: Selection): Selection[] {
    // if (firstPoint == null || secondPoint == null) return []
    // if (JSON.stringify(firstPoint) === JSON.stringify(secondPoint)) return [Selection.clone(firstPoint)];
    // const {row: row1, col: col1} = firstPoint;
    // const {row: row2, col: col2} = secondPoint;
    // const intersections: Selection[] = []

    // if (col1 === col2) {
    //     for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
    //         intersections.push(new Selection(Math.floor(row), Math.floor(col1)))
    //     }
    // }

    // else if (row1 === row2) {
    //     for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
    //         intersections.push(new Selection(Math.floor(row1), Math.floor(col)))
    //     }
    // } else {
    //     const slope: number = (firstPoint.row - secondPoint.row) / (firstPoint.col - secondPoint.col)
    //     const yIntercept: number = row1 - (slope * col1);

    //     for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
    //         const row: number = (slope * col) + yIntercept;
    //         intersections.push(new Selection(Math.floor(row), Math.floor(col)));
    //     }

    //     for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
    //         const col: number = (row - yIntercept) / slope;
    //         intersections.push(new Selection(Math.floor(row), Math.floor(col)));
    //     }
    // }   
    
    // return removeDuplicates(intersections)
// }