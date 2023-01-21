
export class CyclicalArray<T> {
    private readonly array: T[] = [];
    currentIndex: number; 

    constructor(array: Array<T>) {
        if (array.length === 0) {
            throw new Error("Cannot have empty CyclicalArray");
        }

        this.array = array;
        this.currentIndex = 0;
    }

    peekBack() {
        let peekIndex: number = this.currentIndex;
        peekIndex === 0 ? peekIndex = this.array.length - 1 : peekIndex--;
        return this.array[peekIndex];
    }

    back(): T {
        if (this.array.length === 0) {
            throw new Error("Cannot have empty CyclicalArray");
        }

        this.currentIndex === 0 ? this.currentIndex = this.array.length - 1 : this.currentIndex--;
        return this.array[this.currentIndex];
    }

    peekForward() {
        let peekIndex: number = this.currentIndex;
        peekIndex === this.array.length - 1 ? peekIndex = 0 : peekIndex++;
        return this.array[peekIndex];
    }

    forward(): T {
        if (this.array.length === 0) {
            throw new Error("Cannot have empty CyclicalArray");
        }

        this.currentIndex === this.array.length - 1 ? this.currentIndex = 0 : this.currentIndex++;
        return this.array[this.currentIndex];
    }
}