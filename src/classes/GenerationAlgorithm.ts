import { IVector2, IDimension2D, isInBounds2D } from "jsutil";
import { GameMap, getDefaultSkyBox, getTileMap } from "interfaces/GameMap";
import { getDefaultTile, Tile } from "interfaces/Tile";

export interface GenerationAlgorithm {
    readonly name: string;
    generateMap(dimensions: IVector2): GameMap;
}

type GenerationFunction = (dimensions: IDimension2D) => GameMap;

interface GenerationAlgorithmData {
    readonly name: string
    readonly generateMap: GenerationFunction
}

type ValidGenerationAlgorithms = "Recursive Backtracker" | "Kruskal" | "Binary Tree"



const generateRecursiveBacktracker: GenerationFunction = (dimensions) => {
    const tiles: Tile[][] = getTileMap(dimensions, getDefaultTile("Wall Tile"));
    const visited: boolean[][] = Array.from({length: dimensions.height}, () => new Array<boolean>(dimensions.width).fill(false));
    const currentPath: Array<[number, number]> = [];

    const startRow = Math.trunc(Math.random() * dimensions.height);
    const startCol = Math.trunc(Math.random() * dimensions.width);

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

            if (isInBounds2D(tiles, neighborRow, neighborCol)) {
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


const generateKruskal: GenerationFunction = (dimensions) => {
    const matrix: number[][] = Array.from({ length: dimensions.height }, () => new Array<number>(dimensions.width).fill(1))
        const sets: number[][] = [];
    
        for (let row = 0; row < dimensions.height; row++) {
            sets.push(new Array<number>());
            for(let col = 0; col < dimensions.width; col++) {
                sets[row].push(row * dimensions.width + col);
            }
        }
        
        const walls: Array<[number, number]> = [];
        
        for (let row = 0; row < dimensions.height; row += 2) {
            for (let col = 0; col < dimensions.width; col += 2) {
            walls.push([row, col]);
            }
        }
        // walls.sort((a, b) => Math.random() - Math.random());
    
        while (walls.length > 0) {
            const currentWall: [number, number] | undefined = walls.pop();
    
            if (currentWall !== null && currentWall !== undefined) {
                const [currentWallRow, currentWallCol] = currentWall;
                const direction: number = Math.trunc(Math.random() * 2);
    
                const canExpandSideways = isInBounds2D(matrix, currentWallRow, currentWallCol - 1) && isInBounds2D(matrix, currentWallRow, currentWallCol + 1);
                const canExpandUpward = isInBounds2D(matrix, currentWallRow - 1, currentWallCol) && isInBounds2D(matrix, currentWallRow, currentWallCol + 1);
    
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

        const tileMap = matrix.map(row => row.map(val => {
                switch(val) {
                    case 0: return getDefaultTile("Empty Tile"); 
                    case 1: return getDefaultTile("Wall Tile"); 
                    default: return getDefaultTile("Empty Tile"); 
                }
            }
        ));

        return GameMap.fromTileMap("Kruskal Generated", tileMap)
}

const generateBinaryTree: GenerationFunction = (dimensions) => {
    const tiles: Tile[][] = getTileMap(dimensions, getDefaultTile("Wall Tile"));

    for (let row = 0; row < dimensions.height; row += 2) {
        for (let col = 0; col < dimensions.width; col += 2) {
            tiles[row][col] = getDefaultTile("Empty Tile");	
            const selection = Math.trunc(Math.random() * 2);
            if (selection === 1) {
                if (col + 1 < dimensions.width) {
                    tiles[row][col + 1] = getDefaultTile("Empty Tile");	
                }
            } else if (selection === 0) {
                if (row + 1 < dimensions.height) {
                    tiles[row + 1][col] = getDefaultTile("Empty Tile");
                }		
            }	
        }
    }

    return GameMap.fromTileMap("Binary Tree", tiles)
}

const GENERATION_ALGORITHMS_DATA: {[key in ValidGenerationAlgorithms]: GenerationAlgorithmData } = {
    "Recursive Backtracker": Object.freeze({
        name: "Recursive Backtracker",
        generateMap: generateRecursiveBacktracker
    }),
    "Binary Tree": Object.freeze({
        name: "Binary Tree",
        generateMap: generateBinaryTree
    }),
    "Kruskal": Object.freeze({
        name: "Kruskal",
        generateMap: generateKruskal
    })
} 