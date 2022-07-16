import { Cardinal } from "../enums/Cardinal";
import { Tile } from "../interfaces/Tile";
import { Vector2 } from "./Vector2";

export class RaycastHit {
    readonly position: Vector2;
    readonly side: Cardinal;
    readonly hitObject: Tile;

    constructor(position: Vector2, side: Cardinal, hit: Tile) {
        this.position = position;
        this.side = side;
        this.hitObject = hit;
    }
}