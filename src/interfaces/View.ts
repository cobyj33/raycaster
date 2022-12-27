import { IVector2 } from "interfaces/Vector2";

export interface View extends IVector2 {
    readonly cellSize: number;
}

export function getViewOffset(view: View): IVector2 {
    return { row:  view.row * view.cellSize % view.cellSize, col: view.col * view.cellSize % view.cellSize};
}
