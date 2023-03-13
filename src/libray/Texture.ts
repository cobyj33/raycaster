

// TODO: Create constructors for the texture format, as well as the 

import { Color, IBox } from "jsutil/common";
import potpack from "potpack";
import { getImageFileBase64, loadImage } from "jsutil/browser";

const MAX_TEXTURE_SIDELENGTH_SIZE = 256

function imageDataTo2DCanvas(data: ImageData): { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D } {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (context !== null && context !== undefined) {
        canvas.width = data.width;
        canvas.height = data.height;
        context.putImageData(data, 0, 0)
        return { canvas: canvas, context: context }
    }
    throw new Error("Error: Could not convert ImageData to 2D Canvas, could not get canvas 2D context")
}

function convertImageDataForTexture(data: ImageData, maxSideSize: number): ImageData {
    if (data.width <= maxSideSize && data.height <= maxSideSize) {
        return new ImageData(data.data, data.width, data.height)
    }

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (context !== null && context !== undefined) {
        const shrinkFactor = Math.min(maxSideSize / data.width, maxSideSize / data.height)
        console.log("Shrink Factor: ", shrinkFactor)
        canvas.width = data.width * shrinkFactor
        canvas.height = data.height * shrinkFactor
        console.log("Canvas Size: ", canvas.width, canvas.height)

        const { canvas: tempCanvas } = imageDataTo2DCanvas(data)
        context.scale(shrinkFactor, shrinkFactor)
        context.drawImage(tempCanvas, 0, 0)
        return context.getImageData(0, 0, canvas.width, canvas.height)
    }
    throw new Error("Could not convert image to texture, could not create 2D canvas context")
}

/**
 * 
 * All textures can be initialized to 
 */
export class Texture {
    readonly width: number;
    readonly height: number;
    private _data: ImageData
    readonly name: string

    constructor(name: string, data: ImageData) {
        this.name = name
        this._data = convertImageDataForTexture(data, MAX_TEXTURE_SIDELENGTH_SIZE)
        this.width = this._data.width;
        this.height = this._data.height;
    }

    static fromContext2D(name: string, context: CanvasRenderingContext2D) {
        const data: ImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        return new Texture(name, data)
    }

    static fromHTMLImage(name: string, image: HTMLImageElement): Texture {
        const canvas = document.createElement("canvas")
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        if (context === null || context === undefined) {
            throw new Error("Could not create Texture object from HTML Image, could not initialize CanvasRenderingContext2D")
        }
        context.drawImage(image, 0, 0)
        return Texture.fromContext2D(name, context)
    }

    static async fromSourcePath(name: string, src: string): Promise<Texture> {
        const image: HTMLImageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject("Could not load image data at src " + src)
            image.src = src
        })
        return Texture.fromHTMLImage(name, image)
    }

    static async fromFile(name: string, file: File, flipY: boolean = true): Promise<Texture> {
        const base64: string = await getImageFileBase64(file)
        if (!flipY) {
            return Texture.fromSourcePath(name, base64)
        } else {
            const image: HTMLImageElement = await loadImage(base64)
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d")
            if (context !== null && context !== undefined) {
                canvas.width = image.width;
                canvas.height = image.height
                context.translate(0, image.height)
                context.scale(1, -1)
                context.drawImage(image, 0, 0)
                return Texture.fromContext2D(name, context)
            }
            throw new Error("Could not flip image from file " + file.name + ": 2D context could not be created")
        }
    }

    get pixels() {
        return this._data.data;
    }

    draw(context: CanvasRenderingContext2D, x: number, y: number) {
        context.putImageData(this._data, x, y)
    }

    at(row: number, col: number): Color {
        row = Math.trunc(row)
        col = Math.trunc(col)
        const offset = row * this.width * 4 + col * 4
        return new Color(
            this.pixels[offset],
            this.pixels[offset + 1],
            this.pixels[offset + 2],
            this.pixels[offset + 3]
        )
    }

    atTexel(x: number, y: number) {
        return this.at((-y * this.height) + this.height, x * this.width)
    }
}

export class TextureAtlas {
    private readonly textures: Texture[]
    private readonly textureMap: { [key: string]: { box: IBox, texture: Texture } }
    readonly atlas: Texture
    private readonly name: string
    readonly width;
    readonly height;


    constructor(name: string, textures: Texture[]) {
        this.name = name
        this.textures = textures
        const textureBoxes: { w: number, h: number, texture: Texture }[] = textures.map(texture => ({ w: texture.width, h: texture.height, texture: texture }))
        const { w: atlasWidth, h: atlasHeight } = potpack(textureBoxes)
        this.textureMap = {}

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (context === null || context === undefined) {
            throw new Error("Could not initialize Context2D in TextureAtlas")
        }
        canvas.width = Math.max(atlasWidth, 1);
        canvas.height = Math.max(atlasHeight, 1);
        
        textureBoxes.forEach(box => {
            const { w: width, h: height, x: col, y: row, texture } = box as { w: number, h: number, x: number, y: number, texture: Texture }
            texture.draw(context, col, row)
            this.textureMap[texture.name] = { box: { topleft: { row: row, col: col }, size: { width: width, height: height } }, texture: texture }
        })


        const imageData = canvas.width === 0 || canvas.height === 0 ? new ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1) : context.getImageData(0, 0, canvas.width, canvas.height)

        this.atlas = new Texture(name, imageData)
        this.width = canvas.width;
        this.height = canvas.height;
    }

    addTexture(texture: Texture): TextureAtlas {
       return new TextureAtlas(this.name, this.textures.concat(texture))
    }

    addTextures(textures: Texture[]): TextureAtlas {
        return new TextureAtlas(this.name, textures.concat(...this.textures))
    }

    getTexture(name: string): Texture {
        if (this.hasTexture(name)) {
            return this.textureMap[name].texture
        }
        throw new Error(name + " on Texture Atlas " + this.name + " does not exist")
    }

    getTextureNames(): string[] {
        return this.textures.map(texture => texture.name)
    }

    getTextureLocation(name: string): IBox {
        if (this.hasTexture(name)) {
            return this.textureMap[name].box
        }
        throw new Error(name + " on Texture Atlas " + this.name + " does not exist")
    }

    /**
     * All values bounded from 0 to 1
     * (row, col) in texel coordinates, which means they are at the bottom right of the texture position in the atlas, not the top left
     * Consequently, "height", also points upwards instead of downwards
     * @param name 
     * @returns 
     */
    getTextureTexelLocation(name: string): IBox {
        if (this.hasTexture(name)) {
            const textureBox = this.getTextureLocation(name)
            return {
                topleft: {
                    row: textureBox.topleft.row / this.height,
                    col: textureBox.topleft.col / this.width,
                },
                size: {
                    width: textureBox.size.width / this.width,
                    height: textureBox.size.height / this.height
                }
            }
        }
        throw new Error(name + " on Texture Atlas " + this.name + " does not exist")
    }

    hasTexture(name: string): boolean {
        return name in this.textureMap
    }

    get pixels() {
        return this.atlas.pixels;
    }
}

export default Texture;