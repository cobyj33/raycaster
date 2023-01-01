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

// export class Conway implements GenerationAlgorithm {
// 	get name(): string { return "Conway"  }
//     private conway(rows: number, cols: number, cells: number, generations: number): number[][] {
//         let matrix = Array.from({length: rows}, val => new Array<number>(cols).fill(0));
//         for (let i = 0; i < cells; i++) {
//             matrix[Math.trunc(Math.random() * rows)][Math.trunc(Math.random() * cols)] = 1;
//         }

//         for (let i = 0; i < generations; i++) {
//             matrix = conwayGetNextGeneration(matrix);
//         }

//         return matrix;
//     }

//     generateMap(dimensions: Dimension): GameMap {
//         const tiles: Tile[][] = this.conway(dimensions.rows, dimensions.cols, Math.ceil(dimensions.rows * dimensions.cols / 4), 50).map(row => row.map(val => {
//             switch (val) {
//                 case 0: return new EmptyTile(); break;
//                 case 1: return new WallTile(); break;
//                 default: return new EmptyTile(); break;
//             }
//         }));


//         return GameMap.tiled(tiles);
//     }
// }

// export function conwayGetNextGeneration(matrix: number[][]): number[][] {
//     if (matrix.length === 0) {
//         return new Array<Array<number>>();
//     }
//     const width = matrix[0].length;
//     const height = matrix.length;

//     const nextGeneration: number[][] = Array.from({length: height}, val => new Array<number>(width).fill(0));

//     for (let currentRow = 0; currentRow < height; currentRow++) {
//         for (let currentCol = 0; currentCol < width; currentCol++) {
//             let neighbors = 0;
//             for (let neighborRow = currentRow - 1; neighborRow <= currentRow + 1; neighborRow++) {
//                 for (let neighborCol = currentCol - 1; neighborCol <= currentCol + 1; neighborCol++) {
//                     if (neighborRow >= 0 && neighborRow < height && neighborCol >= 0 && neighborCol < width) {
//                         if (matrix[neighborRow][neighborCol] == 1 && !(neighborRow == currentRow && neighborCol == currentCol)) {
//                             neighbors = neighbors + 1;
//                         }
//                     }
//                 }
//             }
        
//             if (matrix[currentRow][currentCol] == 1 && (neighbors == 2 || neighbors == 3)) {
//                 nextGeneration[currentRow][currentCol] = 1;
//             } else if (matrix[currentRow][currentCol] == 0 && neighbors == 3) {
//                 nextGeneration[currentRow][currentCol] = 1;
//             } else {
//                 nextGeneration[currentRow][currentCol] = 0;
//             }
//         }
//     }

//     return nextGeneration;
// }
