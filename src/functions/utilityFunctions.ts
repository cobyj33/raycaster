import { IHasher } from "raycaster/interfaces";

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



