import { Camera, getDefaultCamera } from "interfaces/Camera"
import { GameMap, getEmptyMap } from "interfaces/GameMap"
import { Tile } from "interfaces/Tile"
import { IVector2 } from "interfaces/Vector2"

export {}

export class JRaycaster {
    private map: GameMap
    private camera: Camera
    private tiles: {[key: string]: Tile}

    constructor(dimensions: IVector2) {
        this.map = getEmptyMap(dimensions)
        this.camera = getDefaultCamera(this.map)
        this.tiles = {}
    }

    
}