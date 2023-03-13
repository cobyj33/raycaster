import { IVector2 } from "jsutil";

export interface Box extends IVector2 {
    width: number;
    height: number;
}


export function inBox(inside: IVector2, outside: Box): boolean {
    return inside.row >= outside.row && inside.row <= outside.row + outside.height && inside.col >= outside.col && inside.col <= outside.col + outside.width;
}

export function getBoxCorners(box: Box): IVector2[] {
    return [{
        row: box.row,
        col: box.col
    }, {
        row: box.row + box.height,
        col: box.col
    }, {
        row: box.row + box.height,
        col: box.col + box.width
    }, {
        row: box.row,
        col: box.col + box.width
    }]
}

export function areBoxesIntersecting(first: Box, second: Box): boolean {
    const firstCorners: IVector2[] = getBoxCorners(first);
    if (firstCorners.some(corner => inBox(corner, second))) {
        return true;
    }
    const secondCorners: IVector2[] = getBoxCorners(second);
    if (secondCorners.some(corner => inBox(corner, second))) {
        return true;
    }
    return false;
}

export const getIntersectingArea = (() =>  {
    const emptyBox = { row: 0, col: 0, width: 0, height: 0 }

    return (first: Box, second: Box) => {
        if (!areBoxesIntersecting(first, second)) {
            console.error("Boxes ", first, " and ", second, " do not intersect: cannot find intersecting area");
            return {...emptyBox};
        }  

        const row = Math.max(first.row, second.row);
        const col = Math.max(first.col, second.col);
        const width = Math.abs( col - Math.min(first.col + first.width, second.col + second.width) );
        const height = Math.abs( row - Math.min(first.row + first.height, second.row + second.height) );
        return {
            row: row,
            col: col,
            width: width,
            height: height
        }

    }
})();


export function getEnclosingBox(cells: IVector2[]): Box {
    if (cells.length === 0) {
        return {
            row: 0,
            col: 0,
            width: 0,
            height: 0,
        }
    }

    let minRow = cells[0].row;
    let maxRow = cells[0].row;
    let minCol = cells[0].col;
    let maxCol = cells[0].col;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].row < minRow) {
            minRow = cells[i].row;
        }
        if (cells[i].col < minCol) {
            minCol = cells[i].col;
        }
        if (cells[i].row > maxRow) {
            maxRow = cells[i].row;
        }
        if (cells[i].col > maxCol) {
            maxCol = cells[i].col;
        }
    }

    return {
        row: minRow,
        col: minCol,
        width: Math.abs(maxCol - minCol),
        height: Math.abs(maxRow - minRow)
    }
}

export default { getEnclosingBox, inBox, getIntersectingArea, areBoxesIntersecting, getBoxCorners }