export {  }
// import { Tile } from "../../interfaces/Tile";
// import { Dimension } from "../Data/Dimension";
// import { GameMap } from "../GameMap";
// import { EmptyTile } from "../Tiles/EmptyTile";
// import { WallTile } from "../Tiles/WallTile";
// import { GenerationAlgorithm } from "./GenerationAlgorithm";
// import { getTileMap } from "../../functions/matrixFunctions";

// export class BinaryTree implements GenerationAlgorithm {
// 	get name(): string { return "Binary Tree" } 
//     constructor() { }

//     generateMap(dimensions: Dimension): GameMap {
//         const tiles: Tile[][] = getTileMap(dimensions, new WallTile());

//         for (let row = 0; row < dimensions.rows; row += 2) {
//             for (let col = 0; col < dimensions.cols; col += 2) {
//                 tiles[row][col] = new EmptyTile();	
//                 const selection = Math.trunc(Math.random() * 2);
//                 if (selection === 1) {
//                     if (col + 1 < dimensions.cols) {
//                         tiles[row][col + 1] = new EmptyTile();	
//                     }
//                 } else if (selection === 0) {
//                     if (row + 1 < dimensions.rows) {
//                         tiles[row + 1][col] = new EmptyTile();
//                     }		
//                 }	
//             }
//         }

//         return GameMap.tiled(tiles);
//     }


// }
