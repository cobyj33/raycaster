import { Tile } from "../../interfaces/Tile";
import { Color } from "../Data/Color";

export class WallTile implements Tile {
    constructor() { }
    color() { return new Color(255, 255, 255, 255); }
    clone() { return new WallTile() }
    canHit(): boolean {
        return true;
    }

    toString(): string {
        return "WallTile";
    }
}