export {  }
// import { BlockPickerProps } from "react-color";
// import { FaWarehouse } from "react-icons/fa";
// import { Tile } from "interfaces/Tile";
// import { Dimension } from "../Data/Dimension";
// import { GameMap } from "../GameMap";
// import { GenerationAlgorithm } from "./GenerationAlgorithm";
// import { getTileMap, isInBounds } from "functions/matrixFunctions";
// import { EmptyTile } from "../Tiles/EmptyTile";
// import { WallTile } from "../Tiles/WallTile";

// export class RecursiveBackTracker implements GenerationAlgorithm {
// 	get name(): string { return "Recursive Back-Tracker" } 

//     generateMap(dimensions: Dimension): GameMap {
//         const tiles: Tile[][] = getTileMap(dimensions, new WallTile());
//         const visited: boolean[][] = Array.from({length: dimensions.rows}, val => new Array<boolean>(dimensions.cols).fill(false));
//         const currentPath: Array<[number, number]> = [];

//         const startRow = Math.trunc(Math.random() * dimensions.rows);
//         const startCol = Math.trunc(Math.random() * dimensions.cols);

//         let currentRow = startRow;
//         let currentCol = startCol;
//         let started = false;

//         while (currentPath.length > 0 || !started) {
//             started = true;
//             const cellsAround: Array<[number, number]> = [[currentRow - 2, currentCol], [currentRow + 2, currentCol], [currentRow, currentCol + 2], [currentRow, currentCol - 2]];
//             cellsAround.sort((a, b) => Math.random() - Math.random());

//             let foundPath = false;

//             for (let i = 0; i < cellsAround.length; i++) {
//                 const [neighborRow, neighborCol] = cellsAround[i];

//                 if (isInBounds(tiles, neighborRow, neighborCol)) {
//                     if (visited[neighborRow][neighborCol] === false) {
//                         foundPath = true;
//                         tiles[neighborRow][neighborCol] = new EmptyTile();
//                         tiles[(currentRow + neighborRow) / 2][(currentCol + neighborCol) / 2] = new EmptyTile();
//                         visited[neighborRow][neighborCol] = true;
//                         visited[(currentRow + neighborRow) / 2][(currentCol + neighborCol) / 2] = true;

//                         currentPath.push([currentRow, currentCol]);
//                         currentRow = neighborRow;
//                         currentCol = neighborCol;
//                         break;
//                     }
//                 }
//             }

//             if (foundPath) {
//                 continue;
//             } else {
//                 const lastPos = currentPath.pop();
//                 if (lastPos !== null && lastPos !== undefined) {
//                     currentRow = lastPos[0];
//                     currentCol = lastPos[1];
//                 }
//             }
//         }

//         return GameMap.tiled(tiles);
//     }
// }
