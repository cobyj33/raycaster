import { Vector2, Ray } from "raycaster/interfaces"

export interface RaycastNoHit {
    readonly end: Vector2;
    readonly distance: number;
    readonly originalRay: Ray;
}
