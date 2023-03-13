import { forEach2D, getRectangularMatrixDimensions, isRectangularMatrix, removeDuplicates } from "functions/util";

import { Tile, areEqualTiles, getDefaultTile } from "interfaces/Tile";
import { IVector2, Vector2 } from "./Vector2";
import { RGBA, Color } from "interfaces/Color";
import { inDimensionBounds } from "interfaces/Ray";

import { Dimension2D, IDimension2D } from "jsutil";
import Texture, { TextureAtlas } from "./Texture";


export interface GameMapData {
    readonly tiles: Tile[][];
    readonly dimensions: IDimension2D;
    readonly skyBox: SkyBox;
}

export class GameMap implements GameMapData {
    /** SHOULD NOT BE DIRECTLY MODIFIED */
    readonly tiles: Tile[][];
    readonly dimensions: Dimension2D;
    readonly skyBox: SkyBox;
    readonly textureAtlas: TextureAtlas
    readonly name: string

    constructor(name: string, tiles: Tile[][], dimensions: IDimension2D, skyBox: SkyBox = getDefaultSkyBox(), textures: TextureAtlas | Texture[] | null = null) {
        this.name = name
        if (isValidTileMap(tiles) === false) {
            throw new Error("Invalid tilemap passed to GameMap constructor: " + tiles)
        }
        
        this.tiles = [...tiles];
        this.dimensions = Dimension2D.fromData(dimensions);
        this.skyBox = {...skyBox}
        if (textures === null || textures === undefined) {
            const textures: Texture[] = tiles.map(tileRow => tileRow.filter(tile => tile.texture !== null && tile.texture !== undefined))
                                                .filter(tileRow => tileRow.length > 0)
                                                .flatMap(tileRow => tileRow.map(tile => tile.texture as Texture))
            const uniqueTextures = removeDuplicates(textures)                   
            this.textureAtlas = new TextureAtlas("Map Texture Atlas", uniqueTextures)
        } else {
            if (Array.isArray(textures)) {
                this.textureAtlas = new TextureAtlas("Map Texture Atlas", textures)
            } else {
                this.textureAtlas = textures
            }
        }
    }

    static filledEdges(name: string, dimensions: IDimension2D, fillTile: Tile = getDefaultTile("Wall Tile")) {
        return GameMap.empty(name, dimensions).fillEdges(fillTile)
    }

    static fromTileMap(name: string, tiles: Tile[][]): GameMap {
        if (isValidTileMap(tiles)) {
            const dimensions = new Dimension2D(tiles.length, tiles[0].length)
            return new GameMap(name, tiles, dimensions, getDefaultSkyBox())
        }
        throw new Error("Tried to create GameMap from invalid tile map " + tiles)
    }

    static fromNumberMatrix(name: string, matrix: number[][], mapping: {[key: number]: Tile}): GameMap {
        if (isRectangularMatrix(matrix)) {
            const tileMap: Tile[][] = getTileMap(getRectangularMatrixDimensions(matrix))
            forEach2D(matrix, (val, row, col) => {
                tileMap[row][col] = mapping[val]
            })
            return GameMap.fromTileMap(name, tileMap)
        }
        throw new Error("Tried to create GameMap from non-rectangular matrix " + matrix)
    }

    inBounds(row: number, col: number) {
        return row >= 0 && col >= 0 && row < this.height && col < this.width
    }

    inBoundsVec2({ row, col }: IVector2) {
        return this.inBounds(row, col)
    }

    forEachTile(callbackfn: (value: Tile, index: number, array: Tile[]) => void, thisArg?: any) {
        this.tiles.forEach(tileRow => tileRow.forEach(callbackfn, thisArg))
    }

    forEachLocation(callbackfn: (row: number, col: number, index: number, array: Tile[]) => void, thisArg?: any) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                callbackfn(row, col, row * this.width + col, this.tiles[row])
            }
        }
    }

    forEachTileLocation(callbackfn: (tile: Tile, row: number, col: number, index: number, array: Tile[]) => void, thisArg?: any) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                callbackfn(this.tiles[row][col],  row, col, row * this.width + col, this.tiles[row])
            }
        }
    }

    at(row: number, col: number): Tile {
        if (inDimensionBounds({row: row, col: col}, this.dimensions)) {
            return {...this.tiles[row][col]}
        }
        throw new Error(`Attempted to grab tile from an out of bounds area ( Row: ${row} Col: ${col} ) on dimensions ( width: ${this.dimensions.width}, height: ${this.dimensions.height} ) ) `)
    }

    atVec2({row, col}: { row: number, col: number}): Tile {
        return this.at(row, col)
    }


    set(row: number, col: number, tile: Tile): GameMap {
        if (!(Number.isInteger(row) && Number.isInteger(col))) {
            throw new Error("Attempted to set non-integer position in GameMap, " + row + " " + col)
        }

        const newTiles = cloneTileMap(this.tiles)
        this.tiles[row][col] = tile

        if (tile.texture !== null && tile.texture !== undefined) {
            if (this.textureAtlas.hasTexture(tile.texture.name) === false) {
                return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas.addTexture(tile.texture))
            }
        }
        
        return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas)
    }

    setVec2({ row, col }: IVector2, tile: Tile): GameMap {
        return this.set(row, col, tile)
    }

    setTiles(placementData: { position: IVector2, tile: Tile }[]) {
        const newTiles = cloneTileMap(this.tiles)
        placementData.forEach(data => newTiles[data.position.row][data.position.col] = data.tile)

        const textures: Texture[] = placementData.map(data => data.tile.texture).filter(texture => texture !== null && texture !== undefined) as Texture[]
        const newTextures: Texture[] = textures.filter(texture => this.textureAtlas.hasTexture(texture.name) === false)

        if (newTextures.length > 0) {
            return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas.addTextures(newTextures))
        } else {
            return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas)
        }
    }

    getTextureNames(): string[] {
        return this.textureAtlas.getTextureNames()
    }

    fillEdges(edgeTile: Tile = getDefaultTile("Wall Tile")) {
        const newTiles: Tile[][] = cloneTileMap(this.tiles)

        for (let row = 0; row < this.dimensions.height; row++) {
            for (let col = 0; col < this.dimensions.width; col++) {
                if (row === 0 || row === this.dimensions.height - 1 || col === 0 || col === this.dimensions.width - 1) {
                    newTiles[row][col] = edgeTile;
                }
            }
        }

        if (edgeTile.texture !== null && edgeTile.texture !== undefined) {
            if (this.textureAtlas.hasTexture(edgeTile.texture.name) === false) {
                return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas.addTexture(edgeTile.texture))
            }
        }

        return new GameMap(this.name, newTiles, this.dimensions, this.skyBox, this.textureAtlas)
    }

    static fromGameMapData(name: string, data: GameMapData) {
        return new GameMap(name, data.tiles, data.dimensions, data.skyBox)
    }

    static empty(name: string, dimensions: IDimension2D) {
        return new GameMap(name, getEmptyTileMatrix(dimensions), dimensions, getDefaultSkyBox())
    }

    get width() {
        return this.dimensions.width
    }

    get height() {
        return this.dimensions.height
    }

    get area() {
        return this.width * this.height
    }

    get center(): Vector2 {
        return new Vector2(this.width / 2, this.height / 2)
    }

    equals(other: GameMap) {
        if (!(this.width === other.width && this.height === other.height)) {
            return false;
        }
    
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (!areEqualTiles(this.at(row, col), other.at(row, col))) {
                    return false;
                }
            }
        }
    
        return true;
    }
}

export interface SkyBox {
    readonly floorColor: RGBA;
    readonly skyColor: RGBA;
}

export const getDefaultSkyBox: () => SkyBox = ( () => {
    const defaultFloorColor: RGBA = { red: 0, green: 135, blue: 0, alpha: 255 };
    const defaultSkyColor: RGBA = { red: 135, green: 206, blue: 235, alpha: 255 };

    return (): SkyBox => ({
            floorColor: Color.fromRGBA(defaultFloorColor),
            skyColor: Color.fromRGBA(defaultSkyColor)
        });
    }
)(); 

// export function gameMapInBounds(map: GameMap, row: number, col: number): boolean {
//     if (map.tiles.length === 0) {
//         return false;
//     }

//     return row >= 0 && col >= 0 && row < map.tiles.length && col < map.tiles[0].length;
// }

export function getTileMap(dimensions: IDimension2D, fillTile: Tile = getDefaultTile("Empty Tile")): Tile[][] {
    const tiles: Tile[][] = [];
    for (let row = 0; row < dimensions.height; row++) {
        tiles.push(new Array<Tile>());
        for (let col = 0; col < dimensions.width; col++) {
            tiles[row].push(fillTile);
        }
    }
    
    return tiles;
}

export function getEmptyTileMatrix(dimensions: IDimension2D): Tile[][] {
    const tileArray: Tile[][] = new Array<Array<Tile>>();
    for (let row = 0; row < dimensions.height; row++) {
        tileArray.push(new Array<Tile>());
        for (let col = 0; col < dimensions.width; col++) {
            tileArray[row].push(getDefaultTile("Empty Tile"));
        }
    }

    return tileArray;
}

export function cloneTileMap(tileMap: Tile[][]): Tile[][] {
    return tileMap.map(tileRow => [...tileRow])
}

// export function getFilledMapEdges(map: GameMap, fillTile: Tile = getDefaultTile("Wall Tile")): GameMap {
//     const tiles: Tile[][] = cloneTileMap(map.tiles)

//     for (let row = 0; row < map.dimensions.row; row++) {
//         for (let col = 0; col < map.dimensions.col; col++) {
//             if (row === 0 || row === map.dimensions.row - 1 || col === 0 || col === map.dimensions.col - 1) {
//                 tiles[row][col] = {...fillTile};
//             }
//         }
//     }

//     return {
//         ...map,
//         tiles: tiles
//     }
// }

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


export function tileMapToString(tileMap: Tile[][]): string {
    return tileMap.map((tileRow: Tile[]) => tileRow.map((tile: Tile) => tile.toString()).join() + "\n" ).join(); 
}

export function areGameMapsEqual(first: GameMap, second: GameMap) {
    if (!(first.dimensions.equals(second.dimensions))) {
        return false;
    }

    for (let row = 0; row < first.dimensions.height; row++) {
        for (let col = 0; col < first.dimensions.width; col++) {
            if (!areEqualTiles(first.tiles[row][col], second.tiles[row][col])) {
                return false;
            }
        }
    }

    return true;
}
