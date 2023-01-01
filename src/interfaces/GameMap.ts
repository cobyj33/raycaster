import {
    Tile, areEqualTiles, getDefaultTile,
    IVector2,
    RGBA
} from "raycaster/interfaces"
import Texture from "./Texture";


export interface GameMap {
    readonly tiles: Tile[][];
    readonly dimensions: IVector2;
    readonly skyBox: SkyBox;
}




// export class TileMap {
//     private readonly tiles: Tile[]
//     readonly width: number
//     readonly height: number

//     constructor(tiles: Tile[], width: number, height: number) {
//         this.tiles = tiles;
//         this.width = width;
//         this.height = height;
//     }

//     at(row: number, col: number): Tile {
//         return {...this.tiles[row * this.width + col]}
//     }
// }

// export class GameMap implements GameMapData {
//     readonly tiles: Tile[]; //flattened array
//     readonly dimensions: IVector2;
//     readonly skyBox: SkyBox;
//     readonly atlas: TextureAtlas

//     constructor(tiles: Tile[], dimensions: IVector2, skyBox: SkyBox = getDefaultSkyBox(), textures: Texture[] | null = null) {
//         this.tiles = [...tiles];
//         this.dimensions = {...dimensions};
//         this.skyBox = {...skyBox}
//         if (textures === null || textures === undefined) {
//             const texturedTiles = tiles.filter(tile => tile.texture !== null && tile.texture !== undefined) 
            
//         } else {
//             this.textures = textures
//         }
//     }

//     forEachTile(callbackfn: (value: Tile, index: number, array: Tile[]) => void, thisArg?: any) {
//         this.tiles.forEach(callbackfn, thisArg)
//     }

//     at(row: number, col: number): Tile {
//         return {...this.tiles[row * this.width + col]}
//     }

//     set(row: number, col: number, tile: Tile): GameMap {
//         return new GameMap()
//     }

//     getTextureAtlas() {

//     }

//     setTileMap(tiles: Tile[], dimensions: IVector2): GameMap {
//         if (isValidTileMap(tiles)) {

//             return new GameMap(tiles, this.dimensions, this.skyBox, this.textures);
//         }
//         throw new Error("Invalid tilemap, " + tiles)
//     }

//     getTextures(): Texture[] {
//         return self.textures
//     }

//     fillEdges() {

//     }

//     static fromGameMapData(data: GameMapData) {

//     }

//     static empty(dimensions: IVector2) {
//         return GameMap()
//     }

//     get width() {
//         return this.dimensions.col
//     }

//     get height() {
//         return this.dimensions.row
//     }
// }

export interface SkyBox {
    readonly floorColor: RGBA;
    readonly skyColor: RGBA;
}

export const getDefaultSkyBox: () => SkyBox = ( () => {
    const defaultFloorColor: RGBA = { red: 0, green: 135, blue: 0, alpha: 255 };
    const defaultSkyColor: RGBA = { red: 135, green: 206, blue: 235, alpha: 255 };

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
