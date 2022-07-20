import { IEquatable } from "../../interfaces/IEquatable";

export class Dimension implements IEquatable<Dimension> {
    readonly rows: number;
    readonly cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
    }

    equals(other: Dimension) {
        return this.rows === other.rows && this.cols === other.cols;
    }
}