export class Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    toRGBString(): string {
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }

    darken(amount: number): Color {
        return new Color(Math.max(0, this.red - amount), Math.max(0, this.green - amount), Math.max(0, this.blue - amount), this.alpha);
    }

    lighten(amount: number): Color {
        return new Color(Math.min(255, this.red + amount), Math.min(255, this.green + amount), Math.min(255, this.blue + amount), this.alpha);
    }

    toRGBAString(): string {
        return `rgb(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    }
}