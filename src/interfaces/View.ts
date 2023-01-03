import { IVector2, Vector2 } from "interfaces/Vector2";

export interface IView {
    readonly position: IVector2
    readonly cellSize: number
}

export class View implements IView {
    readonly position: Vector2
    readonly cellSize: number;

    constructor(position: IVector2, cellSize: number) {
        this.position = Vector2.fromIVector2(position)
        this.cellSize = cellSize
    }

    get row() {
        return this.position.row
    }

    get col() {
        return this.position.col
    }

    static fromIView(view: IView) {
        return new View(view.position, view.cellSize)
    }

    withPosition(value: IVector2 | ((vec: Vector2) => IVector2)) {
        if (typeof(value) === "function") {
            return new View(value(this.position), this.cellSize)
        } else {
            return new View(value, this.cellSize)
        }
    }

    withCellSize(value: number | ((curr: number) => number)) {
        if (typeof(value) === "function") {
            return new View(this.position, value(this.cellSize))
        } else {
            return new View(this.position, value)
        }
    }

    offset(): Vector2 {
        return Vector2.fromIVector2(getViewOffset(this))
    }

    clone(): View {
        return new View(this.position, this.cellSize)
    }
}

export function getViewOffset(view: IView): IVector2 {
    return {row: view.position.row * view.cellSize % view.cellSize, col: view.position.col * view.cellSize % view.cellSize};
}
