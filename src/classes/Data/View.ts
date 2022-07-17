import { Vector2 } from "./Vector2";

export class View {
    readonly coordinates: Vector2;
    readonly cellSize: number;

    constructor(coordinates: Vector2, cellSize: number) {
        this.coordinates = coordinates;
        this.cellSize = cellSize;
    }

    withCellSize(cellSize: number): View {
        return new View(this.coordinates, cellSize);
    }

    withCoordinates(coordinates: Vector2): View {
        return new View(coordinates, this.cellSize);
    }

    toString(): string {
        return  `{ View: Coordinates: ${this.coordinates.toString()}, CellSize: ${this.cellSize}  }`
    }

    // offset() {
    //     return new Vector2(coordinates.row % this.cellSize, coordinates.col % this.cellSize);
    // }
}