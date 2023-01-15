

// TODO: Create constructors for the texture format, as well as the 

import { Color } from "interfaces/Color";
import potpack from "potpack";
import { loadConfigFromFile } from "vite";
import { Box } from "./Box";
import { getImageFileBase64 } from "./Image";

// The texture class will simply hold a texture's height, width, and ImageData

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
        this._data = new ImageData(data.data, data.width, data.height)
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

    static async fromFile(name: string, file: File): Promise<Texture> {
        const base64: string = await getImageFileBase64(file)
        return this.fromSourcePath(name, base64)
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
    private readonly textureMap: { [key: string]: { box: Box, texture: Texture } }
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
            this.textureMap[texture.name] = { box: {width: width, height: height, row: row, col: col}, texture: texture }
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

    getTextureLocation(name: string): Box {
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
    getTextureTexelLocation(name: string): Box {
        if (this.hasTexture(name)) {
            const textureBox = this.getTextureLocation(name)
            return {
                row: textureBox.row / this.height,
                col: textureBox.col / this.width,
                width: textureBox.width / this.width,
                height: textureBox.height / this.height
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