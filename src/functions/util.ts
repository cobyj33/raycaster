import { IHasher, midPointBetweenVector2 } from "raycaster/interfaces";
import React from "react"
import { PointerEvent } from "react";
import { IVector2 } from "raycaster/interfaces";


export function removeDuplicates<T>(list: T[]): T[] {
    const tracker = new Set<string>([])

    return list.filter(val => {
        const stringified: string = JSON.stringify(val);
        if (tracker.has(stringified)) {
            return false;
        } else {
            tracker.add(stringified)
            return true
        }
    })
  }

export function removeDuplicatesWithHasher<T>(list: T[], hasher: IHasher<T>): T[] {
    const tracker = new Set<string>([])

    return list.filter(val => {
        const stringified: string = hasher.hash(val);
        if (tracker.has(stringified)) {
            return false;
        } else {
            tracker.add(stringified)
            return true
        }
    })
  }

/**
 * A helper function to get the canvas and Canvas 2D context of a React RefObject
 * Accepts a canvas reference and a callback which only runs if the canvas and context2D from the reference are non-null
 * Meant mostly to cut down on boilerplate of checking for a canvas and then a context, which can take around 5 or 6 lines of code to do absolutely nothing
 * Optionally, there is a function that can be passed in as a third argument if code needs to be run in case the canvas or context could not be found
 * 
 * This is meant to replace getCanvasAndContext2D, as it throws errors which have to be handled, while in most cases when these "errors" are throne nothing is supposed to happen anyway
 * @param callbackfn A callback that takes in a canvas and context2D as parameters, and only runs if the canvas and context are non-null
 * @returns void
 */
export function withCanvasAndContext(canvasRef: React.RefObject<HTMLCanvasElement>, callbackfn: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void, onerror?: () => void) {
    const canvas: HTMLCanvasElement | null = canvasRef.current 
    if (canvas !== null && canvas !== undefined) {
        const context = canvas.getContext("2d");
        if (context !== null && context !== undefined) {
            callbackfn(canvas, context)
            return
        }
    }
    onerror?.()
}

/**
 * A helper function to get the canvas and Canvas 2D context of a React RefObject, as well as handle saving and restoring the 2D context automatically
 * Accepts a canvas reference and a callback which only runs if the canvas and context2D from the reference are non-null
 * Meant mostly to cut down on boilerplate of checking for a canvas and then a context, which can take around 5 or 6 lines of code to do absolutely nothing, as well as saving and restoring context
 * Optionally, there is a function that can be passed in as a third argument if code needs to be run in case the canvas or context could not be found
 * 
 * This is meant to extend withCanvasAndContext
 * @param callbackfn A callback that takes in a canvas and context2D as parameters, and only runs if the canvas and context are non-null
 * @returns void
 */
export function withCanvasAndContextSaved(canvasRef: React.RefObject<HTMLCanvasElement>, callbackfn: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void, onerror?: () => void) {
    const canvas: HTMLCanvasElement | null = canvasRef.current 
    if (canvas !== null && canvas !== undefined) {
        const context = canvas.getContext("2d");
        if (context !== null && context !== undefined) {
            context.save()
            callbackfn(canvas, context)
            context.restore()
            return
        }
    }
    onerror?.()
}

/**
 * A helper function to get the canvas and Canvas 2D context of a React RefObject
 * @param ref A React Ref Object to an HTML Canvas Element
 * @returns The HTML Canvas and the Canvas Rendering Context taken from the ref object
 * @throws Error when either the context cannot be gotten ("HTMLCanvasElement.getContext('2d') returns null or undefined"), or the value inside the ref to the canvas is null or undefined
 */
export function getCanvasAndContext2D(canvasRef: React.RefObject<HTMLCanvasElement>): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas: HTMLCanvasElement | null = canvasRef.current 
    if (canvas !== null && canvas !== undefined) {
        const context = canvas.getContext("2d");
        if (context !== null && context !== undefined) {
            return [canvas, context];
        }
        throw new Error(`Could not get Canvas context, context declared ${context}`)
    }
    throw new Error(`Could not get Canvas Context: Canvas found to be ${canvas}`)
}

export function clamp(value: number, lower: number, higher: number) {
    if (higher < lower) {
        throw new Error("Cannot clamp values, \"higher\" input " + higher + " is lower than \"lower\" input " + lower)
    }
    
    return Math.min(higher, Math.max(lower, value))
}

export function isInBounds<T>(matrix: T[][], row: number, col: number) {
    if (matrix.length === 0) return false;
    return row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length;
}

/**
 * Make the user download a file onto their computer
 * 
 * NOTE: ONLY WORKS INSIDE THE CONTEXT OF THE BROWSER, SHOULD NOT BE USED SERVER-SIDE
 * NOTE: Since we are using vite as of now, this shouldn't matter, but in case of a switch to a different framework it will become necessary
 * NOTE: Implemented as a closure containing an anchor which is used to download files through simulated clicks
 * Probably would need to be modified to work in a non-static site generator, but it does fit into the context of this program
 */
export const requestWebDownload: (data: Blob, fileName: string) => void = ( () => {
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("data-purpose", "downloading")
    document.body.appendChild(downloadAnchor);
    
    return (data: Blob, fileName: string) => {
      const url = URL.createObjectURL(data)
      downloadAnchor.href = url
      downloadAnchor.download = fileName;
      downloadAnchor.click();
    }
  })()

export function isImageFile(file: File): boolean {
  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  return validImageTypes.some(imageType => imageType === file.type)
}

export function pointerPositionInElement(element: Element, event: PointerEvent<Element>): IVector2 {
  const elementBounds: DOMRect = element.getBoundingClientRect();
  // return new IVector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
    return {
        row: Math.trunc(event.clientY - elementBounds.y),
        col: Math.trunc(event.clientX - elementBounds.x)
    }
    return { row: 0, col: 0  };
  }

export async function getImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        }

        image.onerror = () => {
            reject(url)
        }
        image.src = url;
    })
}

export function getNumberMatrix(rows: number, cols: number, fill: number) {
    return Array.from({ length: rows }, () => (Array.from({ length: cols }, () => fill ) ) )
}