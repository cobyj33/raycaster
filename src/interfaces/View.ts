import { Vector2 } from "./Vector2";

export interface View extends Vector2 {
    readonly cellSize: number;
}

export function getViewOffset(view: View): Vector2 {
    return { row:  view.row * view.cellSize % view.cellSize, col: view.col * view.cellSize % view.cellSize};
}
