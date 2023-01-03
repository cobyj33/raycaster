import { IVector2, GameMap, getDefaultSkyBox, getDefaultTile, Tile, getTileMap } from "raycaster/interfaces";
import { isInBounds } from "functions/matrixFunctions";

export interface GenerationAlgorithm {
    readonly name: string;
    generateMap(dimensions: IVector2): GameMap;
}

type ValidGenerationAlgorithms = "Recursive Backtracker" | "Kruskal";
const validAlgorithmsMap: {[key in ValidGenerationAlgorithms]: () => GenerationAlgorithm} = {
    "Recursive Backtracker": () => new RecursiveBackTracker(),
    "Kruskal": () => new Kruskal()
}

export function getGenerationAlgorithm(algo: ValidGenerationAlgorithms): GenerationAlgorithm {
    return validAlgorithmsMap[algo]();
}


export class RecursiveBackTracker implements GenerationAlgorithm {
    readonly name: string = "Recursive Backtracker";

    generateMap(dimensions: IVector2): GameMap {
        const tiles: Tile[][] = getTileMap(dimensions, getDefaultTile("Wall Tile"));
        const visited: boolean[][] = Array.from({length: dimensions.row}, () => new Array<boolean>(dimensions.col).fill(false));
        const currentPath: Array<[number, number]> = [];

        const startRow = Math.trunc(Math.random() * dimensions.row);
        const startCol = Math.trunc(Math.random() * dimensions.col);

        let currentRow = startRow;
        let currentCol = startCol;
        let started = false;

        while (currentPath.length > 0 || !started) {
            started = true;
            const cellsAround: Array<[number, number]> = [[currentRow - 2, currentCol], [currentRow + 2, currentCol], [currentRow, currentCol + 2], [currentRow, currentCol - 2]];
            cellsAround.sort((a, b) => Math.random() - Math.random());
            let foundPath = false;

            for (let i = 0; i < cellsAround.length; i++) {
                const [neighborRow, neighborCol] = cellsAround[i];

                if (isInBounds(tiles, neighborRow, neighborCol)) {
                    if (visited[neighborRow][neighborCol] === false) {
                        foundPath = true;
                        tiles[neighborRow][neighborCol] = getDefaultTile("Empty Tile");
                        tiles[(currentRow + neighborRow) / 2][(currentCol + neighborCol) / 2] = getDefaultTile("Empty Tile");
                        visited[neighborRow][neighborCol] = true;
                        visited[(currentRow + neighborRow) / 2][(currentCol + neighborCol) / 2] = true;

                        currentPath.push([currentRow, currentCol]);
                        currentRow = neighborRow;
                        currentCol = neighborCol;
                        break;
                    }
                }
            }

            if (foundPath) {
                continue;
            } else {
                const lastPos = currentPath.pop();
                if (lastPos !== null && lastPos !== undefined) {
                    currentRow = lastPos[0];
                    currentCol = lastPos[1];
                }
            }
        }

        
        return GameMap.fromTileMap("Recursive Backtracker", tiles)
    }
}




export class Kruskal implements GenerationAlgorithm {
    readonly name: string = "Kruskal";

    private kruskal(rows: number, cols: number): number[][] {
        const matrix: number[][] = Array.from({length: rows}, val => new Array<number>(cols).fill(1));
        const sets: number[][] = [];
    
        for (let row = 0; row < rows; row++) {
            sets.push(new Array<number>());
            for(let col = 0; col < cols; col++) {
                sets[row].push(row * cols + col);
            }
        }
        
        const walls: Array<[number, number]> = [];
        
        for (let row = 0; row < rows; row += 2) {
            for (let col = 0; col < cols; col += 2) {
            walls.push([row, col]);
            }
        }
        // walls.sort((a, b) => Math.random() - Math.random());
    
        while (walls.length > 0) {
            const currentWall: [number, number] | undefined = walls.pop();
    
            if (currentWall !== null && currentWall !== undefined) {
                const [currentWallRow, currentWallCol] = currentWall;
                const direction: number = Math.trunc(Math.random() * 2);
    
                const canExpandSideways = isInBounds(matrix, currentWallRow, currentWallCol - 1) && isInBounds(matrix, currentWallRow, currentWallCol + 1);
                const canExpandUpward = isInBounds(matrix, currentWallRow - 1, currentWallCol) && isInBounds(matrix, currentWallRow, currentWallCol + 1);
    
                if ((direction === 0 && canExpandSideways) || (direction == 1 && !canExpandUpward && canExpandSideways)) {
                    if (sets[currentWallRow][currentWallCol - 1] !== sets[currentWallRow][currentWallCol + 1]) {
                        matrix[currentWallRow][currentWallCol - 1] = 0;
                        matrix[currentWallRow][currentWallCol + 1] = 0;
                        matrix[currentWallRow][currentWallCol] = 0;
                        sets[currentWallRow][currentWallCol] = sets[currentWallRow][currentWallCol - 1];
                        sets[currentWallRow][currentWallCol + 1] = sets[currentWallRow][currentWallCol - 1];	
                    }
                } else if ((direction === 1 && canExpandUpward) || (direction == 0 && !canExpandSideways && canExpandUpward)) {
                    if (sets[currentWallRow - 1][currentWallCol] !== sets[currentWallRow + 1][currentWallCol]) {
                        matrix[currentWallRow - 1][currentWallCol] = 0;
                        matrix[currentWallRow + 1][currentWallCol] = 0;
                        matrix[currentWallRow][currentWallCol] = 0;
                        sets[currentWallRow][currentWallCol] = sets[currentWallRow - 1][currentWallCol];
                        sets[currentWallRow + 1][currentWallCol] = sets[currentWallRow - 1][currentWallCol];	
                    }
                }
                else {
                    matrix[currentWallRow][currentWallCol] = 0;
                }
            }
    
    
        }		
        return matrix;
    }
    

    generateMap(dimensions: IVector2): GameMap {
        const tiles: Tile[][] = this.kruskal(dimensions.row, dimensions.col).map(row => row.map(val => {
            switch (val) {
                case 0: return getDefaultTile("Empty Tile"); 
                case 1: return getDefaultTile("Wall Tile"); 
                default: return getDefaultTile("Empty Tile"); 
            }
        }));


        return GameMap.fromTileMap("Kruskal Generated", tiles)
    }
}


export class BinaryTree implements GenerationAlgorithm {
    readonly name: string = "Binary Tree";

    constructor() { }
    generateMap(dimensions: IVector2): GameMap {
        const tiles: Tile[][] = getTileMap(dimensions, getDefaultTile("Wall Tile"));

        for (let row = 0; row < dimensions.row; row += 2) {
            for (let col = 0; col < dimensions.col; col += 2) {
                tiles[row][col] = getDefaultTile("Empty Tile");	
                const selection = Math.trunc(Math.random() * 2);
                if (selection === 1) {
                    if (col + 1 < dimensions.col) {
                        tiles[row][col + 1] = getDefaultTile("Empty Tile");	
                    }
                } else if (selection === 0) {
                    if (row + 1 < dimensions.row) {
                        tiles[row + 1][col] = getDefaultTile("Empty Tile");
                    }		
                }	
            }
        }

        return GameMap.fromTileMap("Binary Tree", tiles)
    }
}



