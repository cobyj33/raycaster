
export class HistoryStack<T> {
    private history: T[] = [];
    private index: number; 
    private _maxLength: number;

    get maxLength() { return this._maxLength; }
    set maxLength(request: number) {
        if (request <= 0) {
            console.error(`cannot set max history length less than or equal to 0: requested ${ request } `);
        } else if (!Number.isInteger(request)) {
            console.error(`cannot pass non-integer value to history maxLength: requested ${ request }`);
        } else {
            this._maxLength = request;
        }
    } 
    

    get length() { return this.history.length; }
    get state() {
        return this.history[this.index];
    }
    get empty(): boolean { return this.history.length === 0 }

    constructor() {
        this.index = 0;
        this._maxLength = 30;
        this.history = [];
    }

    back(): void {
        if (this.history.length == 0) {
            console.error("ATTEMPTED TO MOVE BACKWARD IN EMPTY HISTORY")
        } else if (this.index <= 0) {
            console.error("ALREADY AT BACK OF HISTORY")
            this.index = 0;
        } else {
            this.index--;
        }
    }

    canGoBack(): boolean {
        return this.history.length > 0 && this.index > 0;
    }
    
    peekLatest(): T {
        if (this.history.length == 0) {
            console.error("EMPTY HISTORY")
        }
        return this.history[this.history.length - 1]
    }

    peek(): T {
        if (this.history.length == 0) {
            console.error("EMPTY HISTORY")
        }
        return this.history[this.index]
    }
 
    forward(): void {
        if (this.history.length == 0) {
            console.error("EMPTY HISTORY")
            return;
        } else if (this.index >= this.history.length) {
            console.error("CANNOT MOVE FORWARD, ALREADY AT FRONT OF HISTORY")
            this.index = this.history.length - 1;
        } else {
            this.index++;
        }
    }

    canGoForward(): boolean {
        return this.history.length > 0 && this.index < this.history.length - 1;
    }

    pushState(data: T): void {
        if (this.history.length == 0) {
            this.history.push(data);
        } else {
            this.history = this.history.slice(0, this.index + 1).concat(data);
        }

        this.index = this.history.length - 1;
    }
}