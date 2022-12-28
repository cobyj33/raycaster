import { RGBA, areEqualColors, isRGBAObject, rgbaToString } from "raycaster/interfaces"
import marbleTexturePath from "assets/Marble.png"
import stoneBrickTexturePath from "assets/Stone Brick Tile.png"
import { getImage } from "functions/image";
import Texture from "interfaces/Texture"

export interface Tile {
    color: RGBA;
    texture: Texture | null;
    canHit: boolean;
    canCollide: boolean;
}


// class Tile {
//     readonly color: RGBA;
//     readonly texture: Texture;
//     readonly canHit: boolean;
//     readonly canCollide: boolean;

//     constructor() {

//     }
// }




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
        if (isRGBAObject(test["color"]) && typeof(test["canHit"]) === "boolean" && typeof(test["canCollide"]) === "boolean") {
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


export const TileTypeArray = ["Empty Tile", "Wall Tile", "Red Tile", "Green Tile", "Blue Tile", "Marble Tile", "Stone Brick Tile"] as const;
type TileTypes = typeof TileTypeArray[number];

/**
 * 
 * It is recommended but not required for tile textures to be the size 128x128
 */
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
    },
    "Stone Brick Tile": {
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
    "Marble Tile": marbleTexturePath,
    "Stone Brick Tile": stoneBrickTexturePath
}

// TODO: Add a way to asyncronously create the textures for the tiles after loading
export async function initTiles() {
    const withSourcePath = Object.entries(textureMap).filter(entry => entry[1] !== null && entry[1] !== undefined) as [TileTypes, string][]
    console.log(withSourcePath)
    const textureLoaders = withSourcePath.map(entry => (async() => {
        console.log("Being called")
        tileTypeDefinitions[entry[0]].texture = await Texture.fromSourcePath(entry[0] + " Texture", entry[1]);
    })() )
    await Promise.all(textureLoaders)

    console.log("Definitions after init: ", tileTypeDefinitions)
}

export function getDefaultTile(tileType: TileTypes) {
    return {...(tileTypeDefinitions[tileType])};
}

export function tileToString(tile: Tile) {
    return `Tile: [
        color: ${rgbaToString(tile.color)},
        canHit: ${tile.canHit},
        canCollide: ${tile.canCollide}
    ]`
}

export function areEqualTiles(first: Tile, second: Tile) {
    if ( first.texture !== null && first.texture !== undefined && second.texture !== null && second.texture !== undefined ) {
        if (first.texture.name !== second.texture.name) {
            return false;
        }
    } else if ( (first.texture !== null && first.texture !== undefined) && (second.texture === null || second.texture === undefined) ) {
        return false;
    } else if ( (first.texture === null || first.texture === undefined) && (second.texture !== null && second.texture !== undefined) ) {
        return false;
    }

    return areEqualColors(first.color, second.color) && first.canHit === second.canHit && first.canCollide === second.canCollide
}


export interface TileJSON {
    name: string,
    color: [number, number, number, number],
    canHit: boolean;
    canCollide: boolean;
}
