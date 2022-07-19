export class Angle {
    public static readonly RADIANSTODEGREES: number = 180.0 / Math.PI;
    public static readonly DEGREESTORADIANS: number = Math.PI / 180.0;

    public static readonly zero = new Angle(0);
    public static readonly quarter = new Angle(Math.PI / 2)
    public static readonly half = new Angle(Math.PI)
    public static readonly threeQuarters = new Angle(3 * Math.PI / 2)


    private _radians: number = 0;
    private _degrees: number = 0;
    
    get radians() { return this._radians; }
    get degrees() { return this._degrees; }

    private constructor(radians? : number, degrees? : number) {
        if (radians !== null && radians !== undefined) {
            this._radians = radians;
            this._degrees = radians * Angle.RADIANSTODEGREES;
        } else if (degrees !== null && degrees !== undefined) {
            this._degrees = degrees;
            this._radians = degrees * Angle.DEGREESTORADIANS;
        }
    }

    static fromDegrees(degrees: number) {
        return new Angle(undefined, degrees); 
    }

    static fromRadians(radians: number) {
        return new Angle(radians, undefined); 
    }

    toString(): string {
        return `Angle(radians: ${this._radians.toPrecision(3)}, degrees: ${this._degrees})`;
    }
}