import { Color, areEqualColors, isColorObject, colorToRGBAString } from "raycaster/interfaces"
import marbleTexturePath from "assets/Marble.png"
import { getImage } from "functions/image";


export interface Tile {
    color: Color;
    texture: HTMLImageElement | null;
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
        canCollide: false,
        texture: null
    }

    return () => ({...basicTile});
})() 

function isTileObject(obj: any): boolean {
    const test: Tile = obj as Tile;
    if (test.color !== null && test.color !== undefined &&
        test.canHit !== null && test.canHit !== undefined &&
        test.canCollide !== null && test.canCollide !== undefined) {
        if (isColorObject(test["color"]) && typeof(test["canHit"]) === "boolean" && typeof(test["canCollide"]) === "boolean") {
            if (test.texture !== null && test.texture !== undefined) {
                if ("tagName" in test.texture) {
                    if (test.texture.tagName === "img") {
                        return true;
                    }
                }
                return false;
            }
            return true;
        }
    }
    return false;
}


export const TileTypeArray = ["Empty Tile", "Wall Tile", "Red Tile", "Green Tile", "Blue Tile", "Marble Tile"] as const;
type TileTypes = typeof TileTypeArray[number];

const tileTypeDefinitions: {[key in TileTypes]: Tile} = {
    "Empty Tile": {
        "color": {
            "red": 60,
            "green": 60,
            "blue": 60,
            "alpha": 255
        },
        "canCollide": false,
        "canHit": false,
        "texture": null
    },
    "Wall Tile": {
        "color": {
            "red": 255,
            "green": 255,
            "blue": 255,
            "alpha": 255
        },
        "canCollide": true,
        "canHit": true,
        "texture": null
    },
    "Red Tile": {
        "color": {
            "red": 255,
            "green": 0,
            "blue": 0,
            "alpha": 255
        },
        "canCollide": true,
        "canHit": true,
        "texture": null
    },
    "Green Tile": {
        "color": {
            "red": 0,
            "green": 255,
            "blue": 0,
            "alpha": 255
        },
        "canCollide": true,
        "canHit": true,
        "texture": null
    },
    "Blue Tile": {
        "color": {
            "red": 0,
            "green": 0,
            "blue": 255,
            "alpha": 255
        },
        "canCollide": true,
        "canHit": true,
        "texture": null
    },
    "Marble Tile": {
        "color": {
            "red": 120,
            "green": 120,
            "blue": 120,
            "alpha": 255
        },
        "canCollide": true,
        "canHit": true,
        "texture": null
    }
}

const textureMap: {[key in TileTypes]: string | null} = {
    "Empty Tile": null,
    "Wall Tile": null,
    "Red Tile": null,
    "Green Tile": null,
    "Blue Tile": null,
    "Marble Tile": marbleTexturePath
}

// TODO: Add a way to asyncronously create the textures for the tiles after loading
export async function initTiles() {
    // ( Object.entries(textureMap).filter(entry => entry[1] !== null && entry[1] !== undefined) as [string, string][] ).forEach(entry => async function() {
    //     getImage.  entry[1]
    // })
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
