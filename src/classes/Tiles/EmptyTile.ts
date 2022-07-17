import { Color } from "../Data/Color";
import { Tile } from "../../interfaces/Tile";

export class EmptyTile implements Tile {
    constructor() { }
    color() { return new Color(30, 30, 30, 30); }
    clone() { return new EmptyTile(); }
    canHit(): boolean {
        return false;
    }

    toString(): string {
        return "EmptyTile";
    }
}