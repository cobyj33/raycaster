import { Vector2 } from "./Vector2";

export interface Shape {
    toCells(): Vector2[];
    area(): number;
}