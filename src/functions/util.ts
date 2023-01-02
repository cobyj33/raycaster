import { IHasher } from "raycaster/interfaces";
import React from "react"

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
 * @param ref A React Ref Object to an HTML Canvas Element
 * @returns The HTML Canvas and the Canvas Rendering Context taken from the ref object
 * @throws Error when either the context cannot be gotten ("HTMLCanvasElement.getContext('2d') returns null or undefined"), or the value inside the ref to the canvas is null or undefined
 */
export function getCanvasAndContext(ref: React.RefObject<HTMLCanvasElement>): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas: HTMLCanvasElement | null = ref.current 
    if (canvas !== null && canvas !== undefined) {
        const context = canvas.getContext("2d");
        if (context !== null && context !== undefined) {
            return [canvas, context];
        }
        throw new Error(`Could not get Canvas context, context declared ${context}`)
    }
    throw new Error(`Could not get Canvas Context: Canvas found to be ${canvas}`)
}





