import { Dimension } from "../classes/Data/Dimension";
import { EmptyTile } from "../classes/Tiles/EmptyTile";
import { Tile } from "../interfaces/Tile";

export function getTileMap(dimensions: Dimension, defaultValue: Tile = new EmptyTile()) {
    const tiles: Tile[][] = [];
    for (let row = 0; row < dimensions.rows; row++) {
        tiles.push(new Array<Tile>());
        for (let col = 0; col < dimensions.cols; col++) {
            tiles[row].push(defaultValue.clone());
        }
    }
    
    return tiles;
}

export function isInBounds<T>(matrix: T[][], row: number, col: number) {
    if (matrix.length === 0) return false;
    return row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length;
}

