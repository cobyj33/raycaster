import { Color } from "../Color";
import { Tile } from "../../interfaces/Tile";

export class EmptyTile implements Tile {
    constructor() { }
    color() { return new Color(0, 0, 0, 1); }
    clone() { return new EmptyTile(); }
    canHit(): boolean {
        return false;
    }

    toString(): string {
        return "EmptyTile";
    }
}