import { Tile } from "../../interfaces/Tile";
import { Color } from "../Data/Color";

export class CustomTile implements Tile {
    name: string;
    customColor: Color;
    _canHit: boolean;
    _canCollide: boolean;
    color() { return this.customColor; }
    canHit() { return this._canHit; }
    canCollide(): boolean {
        return this._canCollide;
    }

    constructor(name: string, color: Color, canHit: boolean, canCollide: boolean) {
        this.name = name;
        this.customColor = color;
        this._canHit = canHit;
        this._canCollide = canCollide;
    }
    
    clone(): Tile {
        return new CustomTile(this.name, this.color(), this.canHit(), this.canCollide());
    }

    toString(): string { return this.name }
}