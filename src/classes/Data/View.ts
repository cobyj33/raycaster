import { Vector2 } from "./Vector2";

export class View {
    readonly coordinates: Vector2;
    readonly cellSize: number;

    constructor(coordinates: Vector2, cellSize: number) {
        this.coordinates = coordinates;
        this.cellSize = cellSize;
    }

    // offset() {
    //     return new Vector2(coordinates.row % this.cellSize, coordinates.col % this.cellSize);
    // }
}