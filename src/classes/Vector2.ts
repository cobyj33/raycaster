import { IClonable } from "../interfaces/IClonable";
import { Angle } from "./Angle";

export class Vector2 implements IClonable<Vector2> {
    public static readonly PRECISION: number = 1000;

    public static readonly up: Vector2 = new Vector2(-1, 0);
    public static readonly down: Vector2 = new Vector2(1, 0);
    public static readonly left: Vector2 = new Vector2(0, -1);
    public static readonly right: Vector2 = new Vector2(0, 1);

    public readonly row: number;
    public readonly col: number;

    get length() { return Math.sqrt( this.row * this.row + this.col * this.col )}

    constructor(row: number, col: number) {
        this.row = Math.round(row * Vector2.PRECISION) / Vector2.PRECISION;
        this.col = Math.round(col * Vector2.PRECISION) / Vector2.PRECISION;
    }

    rotate(angle: Angle): Vector2 {
        const newCol: number = this.col * Math.cos(angle.radians) + this.row * Math.sin(angle.radians);
        const newRow: number = -this.col * Math.sin(angle.radians) + this.row * Math.cos(angle.radians);
        return new Vector2(newRow, newCol);
    }

    toLength(length: number): Vector2 {
        return this.scale(  length / this.length );
    }

    toAngle(): Angle {
        return Angle.fromRadians( Math.atan2(-this.row, this.col) );
    }

    alterToCol(col: number): Vector2 {
        const factor: number = col / this.col;
        return this.scale(factor);
    }

    alterToRow(row: number): Vector2 {
        const factor: number = row / this.row;
        return this.scale(factor);
    }

    normalized(): Vector2 {
        return this.toLength(1);
    }

    
    
    toString(): string {
        return `Vector2: [ Row: ${this.row}, Col: ${this.col} Angle: ${ this.toAngle().degrees }]`
    }



    add(other: Vector2): Vector2 {
        return new Vector2(this.row + other.row, this.col + other.col);
    }

    subtract(other: Vector2): Vector2 {
        return new Vector2(this.row - other.row, this.col - other.col);
    }
    
    scale(scale: number): Vector2 {
        return new Vector2(this.row * scale, this.col * scale);
    }

    int(): Vector2 {
        return new Vector2(Math.floor(this.row), Math.floor(this.col));
    }
    
    static fromAngle(angle: Angle): Vector2 {
        return new Vector2( -Math.sin(angle.radians), Math.cos(angle.radians) );
    }

    static distance(first: Vector2, second: Vector2): number {
        return Math.sqrt( ( first.row - second.row ) * ( first.row - second.row ) + ( first.col - second.col ) * (first.col - second.col) );
    }

    static midPoint(first: Vector2, second: Vector2): Vector2 {
        return new Vector2( ( first.row + second.row ) / 2, (first.col + second.col) / 2);
    }

    static angleBetween(first: Vector2, second: Vector2): Angle {
        return Angle.fromRadians( Math.abs( first.toAngle().radians - second.toAngle().radians ) );
    }
    
    clone() {
        return new Vector2(this.row, this.col);
    }
}

/*

public static Vector2Double DirectionFromTo(Vector2Double source, Vector2Double target) {
        return target - source;
    }

    public override string ToString()
    {
        return $"Vector2Double: [ Row: {this.row}, Col: {this.col} Angle: { this.ToAngleDegrees() }]";
    }
    public static Vector2Double operator +(Vector2Double a, Vector2Double b) => new Vector2Double(a.Row + b.Row, a.Col + b.Col);
    public static Vector2Double operator -(Vector2Double a, Vector2Double b) => new Vector2Double(a.Row - b.Row, a.Col - b.Col);
    public static Vector2Double operator *(Vector2Double a, double b) => new Vector2Double((a.Row * b), (a.Col * b));


    public static Vector2Double FromAngleDegrees(double angleInDegrees) {
        return Vector2Double.FromAngle(angleInDegrees * (Math.PI / 180.0));
    }

    public static Vector2Double FromAngle(double angleInRadians) {
        return new Vector2Double( Math.Round(-Math.Sin(angleInRadians), 3), Math.Round( Math.Cos(angleInRadians), 3) );
    }

    public static double Distance(Vector2Double first, Vector2Double second) {
        return Math.Sqrt(Math.Pow(second.Row - first.Row, 2) + Math.Pow(second.Col - first.Col, 2));
    }

    public static Vector2Double Midpoint(Vector2Double first, Vector2Double second) {
        return new Vector2Double( (first.row + second.row) / 2, ( first.col + second.col) / 2 );
    }
*/