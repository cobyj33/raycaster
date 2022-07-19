import { Color } from "../Data/Color";
import { Tile } from "../../interfaces/Tile";

export class EmptyTile implements Tile {
    name: string = 'Empty Tile';
    constructor() { }
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