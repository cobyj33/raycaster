import { Tile } from "../../interfaces/Tile";
import { Color } from "../Data/Color";

export class WallTile implements Tile {
    name: string = 'Wall Tile';
    constructor() { }
    color() { return new Color(255, 255, 255, 255); }
    clone() { return new WallTile() }
    canCollide() { return true; }
    canHit(): boolean {
        return true;
    }

    toString(): string { return this.name }

}