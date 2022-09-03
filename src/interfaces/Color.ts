export interface Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
}

export const getColorFromCSS = (function() {
    const fillerColor: Color = { red: 0, green: 0, blue: 0, alpha: 0 };
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = 1;
    canvas.height = 1;
    const canvasContext = canvas.getContext("2d");
    return (cssColorName: string): Color => {
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

export function isColorObject(obj: any): boolean {
    if ("red" in obj && "green" in obj && "blue" in obj && "alpha" in obj){
        return typeof(obj["red"]) === "number" && typeof(obj["blue"]) === "number" && typeof(obj["green"]) === "number" && typeof(obj["alpha"]) == "number"
    }
    return false;
}

export function colorToRGBString(color: Color): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

export function darkenColor(color: Color, amount: number): Color {
    return {  red: Math.max(0, color.red - amount), green: Math.max(0, color.green - amount), blue: Math.max(0, color.blue - amount), alpha: color.alpha  }
}

export function lightenColor(color: Color, amount: number): Color {
    return {  red: Math.max(0, color.red + amount), green: Math.max(0, color.green + amount), blue: Math.max(0, color.blue + amount), alpha: color.alpha  }
}

export function colorToRGBAString(color: Color): string {
    return `rgb(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}

export function areEqualColors(first: Color, second: Color): boolean {
    return first.red === second.red && first.green === second.green && first.blue === second.blue && first.alpha === second.alpha;
}

export function getRandomColor(): Color {
    return { red: Math.trunc(Math.random() * 255), blue: Math.trunc(Math.random() * 255), green: Math.trunc(Math.random() * 255), alpha: 255 };
}
