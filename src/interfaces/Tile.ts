import { Color } from "../classes/Color";
import { IClonable } from "./IClonable";

export interface Tile extends IClonable<Tile> {
    color(): Color;
    canHit(): boolean;
    toString(): string;
}