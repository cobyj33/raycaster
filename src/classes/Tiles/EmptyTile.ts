import { Color } from "../Data/Color";
import { Tile } from "../../interfaces/Tile";

export class EmptyTile extends Tile {
    name: string = 'Empty Tile';
    constructor() { super() }
    color() { return new Color(30, 30, 30, 30); }
    clone() { return new EmptyTile(); }
    canCollide(): boolean {
        return false;
    }
    canHit(): boolean {
        return false;
    }
    toString(): string { return this.name }
}