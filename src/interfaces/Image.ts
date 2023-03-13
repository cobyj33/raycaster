import { IVector2 } from "jsutil"

type Pixel = [number, number, number, number]

export async function getImageFileBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = e => {
            if (e.target !== null && e.target !== undefined) {
                if (e.target.result !== null && e.target.result !== undefined) {
                    if (typeof(e.target.result) === "string") {
                        res(e.target.result)
                    }
                    rej(`Could not load base64 of image file ${file.name}: No result of reading file is not a string`)
                }
                rej(`Could not load base64 of image file ${file.name}: No result found from reading file`)
            }
            rej(`Could not load base64 of image file ${file.name}: No target found from reading file`)
        }
        reader.readAsDataURL(file)
    })
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new  Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url; 
    });
}

export function getImageData(image: HTMLImageElement): ImageData {
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    canvas.style.imageRendering = "crisp-edges"
    const context = canvas.getContext("2d")
    if (context !== null && context !== undefined) {
        context.drawImage(image, 0, 0)
        const data = context.getImageData(0, 0, canvas.width, canvas.height)
        console.log(data)
        return data
    }
    throw new Error("Could not initalize canvas context to get image data")
}

export async function getImageDataFromBase64(base64: string): Promise<ImageData> {
    const image = await loadImage(base64)
    return getImageData(image)
}

export async function getImageDataFromFile(file: File): Promise<ImageData> {
    const base64 = await getImageFileBase64(file)
    return getImageDataFromBase64(base64)
}

export function scaleImage(data: HTMLImageElement, factor: number): ImageData | null {
    const canvas = document.createElement("canvas")
    canvas.width = data.width * factor
    canvas.height = data.height * factor
    canvas.style.imageRendering = "crisp-edges"
    const context = canvas.getContext("2d")
    if (context !== null && context !== undefined) {
        context.scale(factor, factor)
        context.drawImage(data, 0, 0)
        const result = context.getImageData(0, 0, data.width * factor, data.height * factor)
        return result
    }
    return null
}


export function getScalingFactor(source: { width: number, height: number }, dest: { width: number, height: number }) {
    return Math.min( dest.width / source.width, dest.height / source.height )
}

export function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    canvas.style.imageRendering = "crisp-edges"
    const context = canvas.getContext("2d")
    if (context !== null && context !== undefined) {
        context.drawImage(image, 0, 0)
    } else {
        console.error("ERROR WHILE GETTING CANVAS IMAGE FOR SPRITESHEET: 2D CONTEXT NOT LOADED ")
    }
    return canvas
}

function getPixelVec2(data: ImageData, position: IVector2): [number, number, number, number] {
    return getPixel(data, position.col, position.row)
}

function getPixel(data: ImageData, x: number, y: number): [number, number, number, number] {
    return [0, 1, 2, 3].map(num => data.data[y * data.width * 4 + x * 4 + num]) as [number, number, number, number]
}

function getPixels(data: ImageData): Pixel[][] {
    return Array.from({length: data.height}, (_, row) => Array.from({length: data.width}, (_, col) => getPixel(data, col, row)))
}

function equalPixels(first: Pixel, second: Pixel) {
    return first[0] === second[0] && first[1] === second[1] && first[2] === second[2] && first[3] === second[3]
}

export default { getImageFileBase64, loadImage, getImageData, getImageDataFromBase64, getImageDataFromFile }