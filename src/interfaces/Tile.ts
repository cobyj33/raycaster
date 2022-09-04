import { Color, areEqualColors, isColorObject, colorToRGBAString } from "raycaster/interfaces"

export interface Tile {
    color: Color;
    canHit: boolean;
    canCollide: boolean;
}


export const getFillerTile = (function() {
    const basicTile: Tile = {
        color: {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0
        },
        canHit: false,
        canCollide: false
    }

    return () => ({...basicTile});
})() 

function isTileObject(obj: any): boolean {
    const test: Tile = obj as Tile;
    if (test.color !== null && test.color !== undefined &&
    test.canHit !== null && test.canHit !== undefined &&
        test.canCollide !== null && test.canCollide !== undefined) {
        
        return isColorObject(test["color"]) && typeof(test["canHit"]) === "boolean" && typeof(test["canCollide"]) === "boolean"
    }
    return false;
}

export const TileTypeArray = ["Empty Tile", "Wall Tile", "Red Tile", "Green Tile", "Blue Tile"] as const;
type TileTypes = typeof TileTypeArray[number];

const tileTypeDefinitions: {[key in TileTypes]: Tile} = {
    "Empty Tile": getFillerTile(),
    "Wall Tile": getFillerTile(),
    "Red Tile": getFillerTile(),
    "Green Tile": getFillerTile(),
    "Blue Tile": getFillerTile()
}

export async function initTiles() {
    return fetch("json/tiles.json", {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response => response.json())
        .then(json => {
            console.log(json);
            if (typeof(json) == "object") {
                const pairs: Array<[any, any]> = Object.entries(json);
                pairs.forEach((entry) => {
                    const [key, value] = entry;
                    if (key !== null && key !== undefined && value !== null && value !== undefined) {
                        if (key in tileTypeDefinitions && isTileObject(value)) {
                            tileTypeDefinitions[key as TileTypes] = value as Tile;
                        } else {
                            if (!(key in tileTypeDefinitions)) {
                                throw new Error("Invalid tile type, not in definitions: ", key);
                            }
                            if (!isTileObject(value)) {
                                throw new Error("Invalid tile data: not recognized as tile json: ", value);
                            }
                        }
                }})
            }

        })
        .catch(error => {
            console.error("ERROR FETCHING DEFAULT TILES: ", error);
        })
}

export function getDefaultTile(tileType: TileTypes) {
    return {...(tileTypeDefinitions[tileType])};
}

export function tileToString(tile: Tile) {
    return `Tile: [
        color: ${colorToRGBAString(tile.color)},
        canHit: ${tile.canHit},
        canCollide: ${tile.canCollide}
    ]`
}

export function areEqualTiles(first: Tile, second: Tile) {
    return areEqualColors(first.color, second.color) && first.canHit === second.canHit && first.canCollide === second.canCollide;
}


export interface TileJSON {
    name: string,
    color: [number, number, number, number],
    canHit: boolean;
    canCollide: boolean;
}
