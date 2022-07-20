import { Color } from "../classes/Data/Color";
import { IClonable } from "./IClonable";
import { IEquatable } from "./IEquatable";

export abstract class Tile implements IClonable<Tile>, IEquatable<Tile> {
    abstract name: string;
    abstract color(): Color;
    abstract canHit(): boolean;
    abstract canCollide(): boolean;
    abstract toString(): string;
    abstract clone(): Tile;
    equals(other: Tile): boolean {
        return this.name === other.name && this.color().equals(other.color()) && this.canHit() === other.canHit()
        && this.canCollide() === other.canCollide();
    }
}