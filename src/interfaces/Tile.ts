import { Color } from "../classes/Data/Color";
import { IClonable } from "./IClonable";

export interface Tile extends IClonable<Tile> {
    name: string;
    color(): Color;
    canHit(): boolean;
    toString(): string;
}