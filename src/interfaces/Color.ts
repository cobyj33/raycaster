export interface RGB {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}

export interface RGBA extends RGB {
    readonly alpha: number;
}

/**
 * Stores color data as an RGBA with each value in the range 0 - 255
 */
export class Color implements RGBA {
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
    
    static fromCSS(name: string): Color {
        const color: RGBA = getColorFromCSS(name)
        return new Color(color.red, color.green, color.blue, color.alpha)
    }

    static random(): Color {
        const color = getRandomColor();
        return new Color(
            color.red,
            color.green,
            color.blue,
            color.alpha
        )
    }
    
    darken(percent: number): Color {
        return new Color(
            (1 - percent) * this.red, 
            (1 - percent) * this.green, 
            (1 - percent) * this.blue, 
            this.alpha 
        )
    }

    lighten(percent: number): Color {
        return new Color(
            this.red + percent * (255 - this.red), 
            this.green + percent * (255 - this.green), 
            this.blue + percent * (255 - this.blue), 
            this.alpha
        )
    }

    normalized(): Color {
        return new Color(
            this.red / 255,
            this.blue / 255,
            this.green / 255,
            this.alpha / 255
        )
    }

    rgb(): RGB {
        return {
            red: this.red,
            green: this.green,
            blue: this.blue
        }
    }
}


export const getColorFromCSS = (function() {
    const fillerColor: RGBA = { red: 0, green: 0, blue: 0, alpha: 0 };
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = 1;
    canvas.height = 1;
    const canvasContext = canvas.getContext("2d");
    return (cssColorName: string): RGBA => {
        if (canvasContext !== null && canvasContext !== undefined) {
            canvasContext.fillStyle = cssColorName;
            canvasContext.fillRect(0, 0, 1, 1);
            const imageData: ImageData = canvasContext.getImageData(0, 0, 1, 1);
            return {
                red: imageData.data[0],
                green: imageData.data[1],
                blue: imageData.data[2],
                alpha: imageData.data[3]
            }
        } 
        return {...fillerColor};
    }
})();

export function isRGBAObject(obj: any): boolean {
    if ("red" in obj && "green" in obj && "blue" in obj && "alpha" in obj){
        return typeof(obj["red"]) === "number" && typeof(obj["blue"]) === "number" && typeof(obj["green"]) === "number" && typeof(obj["alpha"]) == "number"
    }
    return false;
}

export function rgbToString(color: RGB): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

// export function darkenColor(color: RGBA, amount: number): RGBA {
//     return {  red: Math.max(0, color.red - amount), green: Math.max(0, color.green - amount), blue: Math.max(0, color.blue - amount), alpha: color.alpha  }
// }

// export function lightenColor(color: RGBA, amount: number): RGBA {
//     return {  red: Math.max(0, color.red + amount), green: Math.max(0, color.green + amount), blue: Math.max(0, color.blue + amount), alpha: color.alpha  }
// }

export function rgbaToString(color: RGBA): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}

export function areEqualColors(first: RGBA, second: RGBA): boolean {
    return first.red === second.red && first.green === second.green && first.blue === second.blue && first.alpha === second.alpha;
}

export function getRandomColor(): RGBA {
    return { red: Math.trunc(Math.random() * 255), blue: Math.trunc(Math.random() * 255), green: Math.trunc(Math.random() * 255), alpha: 255 };
}
