

// TODO: Create constructors for the texture format, as well as the 
// The texture class will simply hold a texture's height, width, and ImageData
class Texture {
    private readonly canvas: HTMLCanvasElement
    private readonly context: CanvasRenderingContext2D
    private _loaded: boolean = false
    private _data: ImageData | null = null
    readonly width: number
    readonly height: number

    constructor(width: number, height: number, data: ImageData) {
        this.width = width;
        this.height = height
        this._loaded = false

        this.canvas = document.createElement("canvas")
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
        if (this.context === null || this.context === undefined) {
            throw new Error("Could not create Texture object from HTML Image, could not initialize CanvasRenderingContext2D")
        }

        const image: HTMLImageElement = document.createElement("img")
        image.onload = (e) => {
            this._loaded = true;
            this.context.drawImage(image, 0, 0)
            const data: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        }

    }  

    get loaded() {
        return this._loaded;
    }
}

// export interface Texture {
//     readonly width: number
//     readonly height: number
//     readonly imageData: ImageData
//     readonly canvas: CanvasRenderingContext2D
// }

export async function createTextureFromPath(path: string) {

}

export function createTextureFromHTMLImage(image: HTMLImageElement) {
    const canvas = document.createElement("canvas")
    const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D
    if (context === null || context === undefined) {
        throw new Error("Could not create Texture object from HTML Image, could not initialize CanvasRenderingContext2D")
    }

    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0)
    const data: ImageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return {
        width: canvas.width,
        height: canvas.height,
        image: canvas,
        data: data
    }
}