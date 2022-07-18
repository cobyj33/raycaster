import { Tile } from "../../interfaces/Tile";
import { Color } from "../Data/Color";

export class CustomTile implements Tile {
    name: string;
    customColor: Color;
    _canHit: boolean;
    color() { return this.customColor; }
    canHit() { return this._canHit; }

    constructor(name: string, color: Color, canHit: boolean) {
        this.name = name;
        this.customColor = color;
        this._canHit = canHit;
    }
    
    clone(): Tile {
        return new CustomTile(this.name, this.color(), this.canHit());
    }

    toString(): string { return this.name }
}