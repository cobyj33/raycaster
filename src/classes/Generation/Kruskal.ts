export {  }
// import { isInBounds } from "functions/util";
// import { Tile } from "interfaces/Tile";
// import { Dimension } from "../Data/Dimension";
// import { GameMap } from "../GameMap";
// import { EmptyTile } from "../Tiles/EmptyTile";
// import { WallTile } from "../Tiles/WallTile";
// import { GenerationAlgorithm } from "./GenerationAlgorithm";

// export class Kruskal implements GenerationAlgorithm {
// 	get name(): string { return "Kruskal" } 

//     private kruskal(rows: number, cols: number): number[][] {
//         const matrix: number[][] = Array.from({length: rows}, val => new Array<number>(cols).fill(1));
//         const sets: number[][] = [];
    
//         for (let row = 0; row < rows; row++) {
//             sets.push(new Array<number>());
//             for(let col = 0; col < cols; col++) {
//                 sets[row].push(row * cols + col);
//             }
//         }
        
//         const walls: Array<[number, number]> = [];
        
//         for (let row = 0; row < rows; row += 2) {
//             for (let col = 0; col < cols; col += 2) {
//             walls.push([row, col]);
//             }
//         }
//         // walls.sort((a, b) => Math.random() - Math.random());
    
//         while (walls.length > 0) {
//             const currentWall: [number, number] | undefined = walls.pop();
    
//             if (currentWall !== null && currentWall !== undefined) {
//                 const [currentWallRow, currentWallCol] = currentWall;
//                 const direction: number = Math.trunc(Math.random() * 2);
    
//                 const canExpandSideways = isInBounds(matrix, currentWallRow, currentWallCol - 1) && isInBounds(matrix, currentWallRow, currentWallCol + 1);
//                 const canExpandUpward = isInBounds(matrix, currentWallRow - 1, currentWallCol) && isInBounds(matrix, currentWallRow, currentWallCol + 1);
    
//                 if ((direction === 0 && canExpandSideways) || (direction == 1 && !canExpandUpward && canExpandSideways)) {
//                     if (sets[currentWallRow][currentWallCol - 1] !== sets[currentWallRow][currentWallCol + 1]) {
//                         matrix[currentWallRow][currentWallCol - 1] = 0;
//                         matrix[currentWallRow][currentWallCol + 1] = 0;
//                         matrix[currentWallRow][currentWallCol] = 0;
//                         sets[currentWallRow][currentWallCol] = sets[currentWallRow][currentWallCol - 1];
//                         sets[currentWallRow][currentWallCol + 1] = sets[currentWallRow][currentWallCol - 1];	
//                     }
//                 } else if ((direction === 1 && canExpandUpward) || (direction == 0 && !canExpandSideways && canExpandUpward)) {
//                     if (sets[currentWallRow - 1][currentWallCol] !== sets[currentWallRow + 1][currentWallCol]) {
//                         matrix[currentWallRow - 1][currentWallCol] = 0;
//                         matrix[currentWallRow + 1][currentWallCol] = 0;
//                         matrix[currentWallRow][currentWallCol] = 0;
//                         sets[currentWallRow][currentWallCol] = sets[currentWallRow - 1][currentWallCol];
//                         sets[currentWallRow + 1][currentWallCol] = sets[currentWallRow - 1][currentWallCol];	
//                     }
//                 }
//                 else {
//                     matrix[currentWallRow][currentWallCol] = 0;
//                 }
//             }
    
    
//         }		
//         return matrix;
//     }
    

//     generateMap(dimensions: Dimension): GameMap {
//         const tiles: Tile[][] = this.kruskal(dimensions.rows, dimensions.cols).map(row => row.map(val => {
//             switch (val) {
//                 case 0: return new EmptyTile(); break;
//                 case 1: return new WallTile(); break;
//                 default: return new EmptyTile(); break;
//             }
//         }));


//         return GameMap.tiled(tiles);
//     }
// }
