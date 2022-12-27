import {
    Tile, areEqualTiles, TileJSON, getDefaultTile,
    IVector2,
    Color
} from "raycaster/interfaces"

export interface GameMap {
    readonly tiles: Tile[][];
    readonly dimensions: IVector2;
    readonly skyBox: SkyBox;
}

export interface SkyBox {
    readonly floorColor: Color;
    readonly skyColor: Color;
}

export const getDefaultSkyBox: () => SkyBox = ( () => {
    const defaultFloorColor: Color = { red: 0, green: 135, blue: 0, alpha: 255 };
    const defaultSkyColor: Color = { red: 135, green: 206, blue: 235, alpha: 255 };

    return (): SkyBox => ({
            floorColor: {...defaultFloorColor},
            skyColor: {...defaultSkyColor}
        });
    }
)(); 

export function gameMapInBounds(map: GameMap, row: number, col: number): boolean {
    if (map.tiles.length === 0) {
        return false;
    }

    return row >= 0 && col >= 0 && row < map.tiles.length && col < map.tiles[0].length;
}

export function getTileMap(dimensions: IVector2, defaultValue: Tile = getDefaultTile("Empty Tile")) {
    const tiles: Tile[][] = [];
    for (let row = 0; row < dimensions.row; row++) {
        tiles.push(new Array<Tile>());
        for (let col = 0; col < dimensions.col; col++) {
            tiles[row].push({...defaultValue});
        }
    }
    
    return tiles;
}


export function getEmptyMap(dimensions: IVector2): GameMap {
    return {
        tiles: getEmptyTileMatrix(dimensions),
        dimensions: {...dimensions},
        skyBox: getDefaultSkyBox()
    }
}

export function getEmptyTileMatrix(dimensions: IVector2): Tile[][] {
    const tileArray: Tile[][] = new Array<Array<Tile>>();
    for (let row = 0; row < dimensions.row; row++) {
        tileArray.push(new Array<Tile>());
        for (let col = 0; col < dimensions.col; col++) {
            tileArray[row].push(getDefaultTile("Empty Tile"));
        }
    }

    return tileArray;
}

export function getFilledMapEdges(map: GameMap, fillTile: Tile = getDefaultTile("Wall Tile")): GameMap {
    const tiles: Tile[][] = map.tiles.map( row => row.map(tile => ({...tile} ) ) );

    for (let row = 0; row < map.dimensions.row; row++) {
        for (let col = 0; col < map.dimensions.col; col++) {
            if (row === 0 || row === map.dimensions.row - 1 || col === 0 || col === map.dimensions.col - 1) {
                tiles[row][col] = {...fillTile};
            }
        }
    }

    return {
        ...map,
        tiles: tiles
    }
}

export function isValidTileMap(tiles: Tile[][]): boolean {
    if (tiles.length === 0) { return false; }
    const width: number = tiles[0].length;

    for (let row = 0; row < tiles.length; row++) {
        if (tiles[row].length !== width) {
            return false;
        }

        for (let col = 0; col < tiles[row].length; col++) {
            if (tiles[row][col] === null || tiles[row][col] === undefined) {
                return false;
            }
        }
    }

    return true;
}


export function gameMapToString(map: GameMap): string {
    return map.tiles.map((tileRow: Tile[]) => tileRow.map((tile: Tile) => tile.toString()).join() + "\n" ).join(); 
}

export function areGameMapsEqual(first: GameMap, second: GameMap) {
    if (!(first.dimensions.row === second.dimensions.row && first.dimensions.col === second.dimensions.col)) {
        return false;
    }

    for (let row = 0; row < first.dimensions.row; row++) {
        for (let col = 0; col < first.dimensions.col; col++) {
            if (!areEqualTiles(first.tiles[row][col], second.tiles[row][col])) {
                return false;
            }
        }
    }

    return true;
}


export interface BoardJSON {
    tiles: string[]; //names
    dimensions: [number, number];
}



export interface MapSave {
    board: BoardJSON;
    savedTiles: TileJSON[];
}
