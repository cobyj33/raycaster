import { Dimension } from "./Data/Dimension";
import { Tile } from "../interfaces/Tile";
import { EmptyTile } from "./Tiles/EmptyTile";
import { TimeHTMLAttributes } from "react";
import { Vector2 } from "./Data/Vector2";
import { WallTile } from "./Tiles/WallTile";

export class GameMap {
    private tiles: Tile[][];
    private dimensions: Dimension;

    get Dimensions() { return new Dimension(this.dimensions.rows, this.dimensions.cols) }

    private constructor(dimensions: Dimension, tiles?: Tile[][]) {
        if (tiles != null && tiles != undefined) {
            this.tiles = tiles;
        } else {
            this.tiles = GameMap.EmptyTileMatrix(dimensions);
        }
        this.dimensions = dimensions;
    }

    private static EmptyTileMatrix(dimensions: Dimension): Tile[][] {
        const tileArray: Tile[][] = new Array<Array<Tile>>();
        for (let row = 0; row < dimensions.rows; row++) {
            tileArray.push(new Array<Tile>());
            for (let col = 0; col < dimensions.cols; col++) {
                tileArray[row].push(new EmptyTile());
            }
        }

        return tileArray;
    }

    static empty(dimensions: Dimension): GameMap {
        return new GameMap(dimensions);
    }

    
    static tiled(tiles: Tile[][]): GameMap {
        if (this.isValidTileMap(tiles)) {
            return new GameMap(new Dimension(tiles.length, tiles[0].length), tiles);
        }
        throw new Error("Invalid tile map, make sure to check validity with GameMap.isValidTileMap(tiles)");
    }

    static copyTiles(tiles: Tile[][]): Tile[][] {
        return tiles.map(tileRow => tileRow.map(tileCol => tileCol.clone()));
    }

    private static cloneTiles(tiles: Tile[][]): Tile[][] {
        return tiles.map(tileRow => tileRow.map(tileCol => tileCol));
    }

    public static filledEdges(dimensions: Dimension): GameMap {
        const tiles: Tile[][] = this.EmptyTileMatrix(dimensions);
        for (let row = 0; row < dimensions.rows; row++) {
            for (let col = 0; col < dimensions.cols; col++) {
                if (row == 0 || row == dimensions.rows - 1 || col == 0 || col == dimensions.cols - 1) {
                    tiles[row][col] = new WallTile();
                }
            }
        }

        return new GameMap(dimensions, tiles);
    }

    public static random(dimensions: Dimension, amount: number): GameMap {
        const tiles: Tile[][] = this.EmptyTileMatrix(dimensions);
        for (let row = 0; row < dimensions.rows; row++) {
            for (let col = 0; col < dimensions.cols; col++) {
                if (row == 0 || row == dimensions.rows - 1 || col == 0 || col == dimensions.cols - 1) {
                    tiles[row][col] = new WallTile();
                }
            }
        }

        for (let i = 0; i < amount; i++) {
            tiles[Math.floor(Math.random() * dimensions.rows)][Math.floor(Math.random() * dimensions.cols)] = new WallTile();
        }

        return new GameMap(dimensions, tiles);
    }
    
    static isValidTileMap(tiles: Tile[][]): boolean {
        if (tiles.length == 0) { return false; }
        const width: number = tiles[0].length;

        for (let row = 0; row < tiles.length; row++) {
            if (tiles[row].length != width) {
                return false;
            }
            for (let col = 0; col < tiles[row].length; col++) {
                if (tiles[row][col] == null || tiles[row][col] == undefined) {
                    return false;
                }
            }
        }

        return true;
    }

    placeTile(tile: Tile, row: number, col: number): GameMap {
        const tiles: Tile[][] = GameMap.cloneTiles(this.tiles);
        tiles[row][col] = tile;
        return GameMap.tiled(tiles);
    }

    get center(): Vector2 {
        return new Vector2( this.dimensions.rows / 2, this.dimensions.cols / 2  );
    }

    at(row: number, col: number) {
        return this.tiles[row][col];
    }

    inBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.dimensions.rows && col >= 0 && col < this.dimensions.cols;
    }

    toString(): string {
        return this.tiles.map(  tileRow => tileRow.map(tile => tile.toString()).join() + "\n" ).join(); 
    }
}

// public class Map {

//     public void PlaceTile(Tile tile, Vector2Int position) {
//         tiles[position.row,position.col] = tile;
//     }

//     public Vector2Double Center { get => new Vector2Double(tiles.GetLength(0) / 2, tiles.GetLength(1) / 2); }
//     public bool InBounds(Vector2Double doubleVector) {
//         return InBounds(doubleVector.Int());
//     }

//     public bool InBounds(Vector2Int vector) {
//         return vector.row >= 0 && vector.row < tiles.GetLength(0) && vector.col >= 0 && vector.col < tiles.GetLength(1);
//     }

//     public Tile At(int row, int col) {
//         return tiles[row,col];
//     }

//     public Tile At(Vector2Int vector2Int) {
//         return tiles[vector2Int.row,vector2Int.col];
//     }

//     public void FillEdges() {
//         for (int row = 0; row < tiles.GetLength(0); row++) {
//             for (int col = 0; col < tiles.GetLength(1); col++) {
//                 if (row == 0 || row == tiles.GetLength(0) - 1 || col == 0 || col == tiles.GetLength(1) - 1) {
//                     tiles[row,col] = new WallTile();  
//                 }
//             }
//         }
//     }

//     public override string ToString() {
//         StringBuilder builder = new StringBuilder();
//         for (int row = 0; row < tiles.GetLength(0); row++) {
//             for (int col = 0; col < tiles.GetLength(1); col++) {
//                 builder.Append(tiles[row,col].ToString());
//             }
//             builder.AppendLine();
//         }
//         return builder.ToString();
//     }

//     public string ToString<T>(T element) where T: IPositionable, IDrawable {
//         StringBuilder builder = new StringBuilder();
//         for (int row = 0; row < tiles.GetLength(0); row++) {
//             for (int col = 0; col < tiles.GetLength(1); col++) {

//                 if ((int)element.Position.row == row && (int)element.Position.col == col) {
//                     builder.Append(element.Char);
//                 } else {
//                     builder.Append(tiles[row,col].ToString());
//                 }
//             }
//             builder.AppendLine();
//         }

//         return builder.ToString();
//     }
// }