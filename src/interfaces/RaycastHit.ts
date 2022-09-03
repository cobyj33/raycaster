import { Vector2, Tile, Ray } from "raycaster/interfaces"
import { Cardinal } from "raycaster/types"

export interface RaycastHit {
    readonly position: Vector2;
    readonly side: Cardinal;
    readonly hitObject: Tile;
    readonly originalRay: Ray;
}
