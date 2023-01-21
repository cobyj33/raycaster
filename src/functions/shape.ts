import { IVector2 } from "interfaces/Vector2";
import { removeDuplicates } from "functions/util";


export function getLine(start: IVector2, end: IVector2): IVector2[] {
        if (start.row === end.row && start.col === end.col) { return [{ ...start }]; }
        const {row: row1, col: col1} = start;
        const {row: row2, col: col2} = end;
        const intersections: IVector2[] = []
    
        if (col1 === col2) {
            for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
                intersections.push({ row: Math.trunc(row), col: Math.trunc(col1) })
            }
        }
        else if (row1 === row2) {
            for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
                intersections.push({ row: Math.trunc(row1), col: Math.trunc(col) });
            }
        } else {
            const slope: number = (row1 - row2) / (col1 - col2)
            const yIntercept: number = row1 - (slope * col1);
            for (let col = Math.min(col1, col2); col <= Math.max(col1, col2); col++) {
                const row: number = (slope * col) + yIntercept;
                intersections.push({ row: Math.trunc(row), col: Math.trunc(col) });
            }
            for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
                const col: number = (row - yIntercept) / slope;
                intersections.push({ row: Math.trunc(row), col: Math.trunc(col) });
            }
        }   
        
        return removeDuplicates(intersections)
    }

export function getEllipse(start: IVector2, end: IVector2): IVector2[] {
        if (start.row === end.row && start.col === end.col) { return [{ ...start }]; }
        const {row: row1, col: col1} = start;
        const {row: row2, col: col2} = end;
        const centerCol: number = (col1 + col2) / 2
        const centerRow: number = (row1 + row2 ) / 2
        const horizontalRadius: number = Math.abs(col1 - col2) / 2;
        const verticalRadius: number = Math.abs(row1 - row2) / 2;
        const intersections: IVector2[] = []

        if (col1 == col2 || row1 == row2) {
            return getLine(start, end);
        }
       
        for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col += 1) {
            const evaluation: number = Math.sqrt(Math.pow(verticalRadius, 2) * (1  - (Math.pow(col - centerCol, 2) / Math.pow(horizontalRadius, 2) ) ))
            intersections.push({ row: Math.floor(centerRow + evaluation), col: Math.floor(col) } );
            intersections.push({ row: Math.floor(centerRow - evaluation), col: Math.floor(col) } );
        } 
    
        for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row += 1) {
            const evaluation: number = Math.sqrt(Math.pow(horizontalRadius, 2) * (1  - (Math.pow(row - centerRow, 2) / Math.pow(verticalRadius, 2) ) ))
            intersections.push({ row: Math.floor(row), col: Math.floor(centerCol + evaluation) } );
            intersections.push({ row: Math.floor(row), col: Math.floor(centerCol - evaluation) } );
        } 
        
        return removeDuplicates(intersections)
    }
