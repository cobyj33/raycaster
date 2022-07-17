import {KeyboardEvent} from 'react';

interface KeyAction {
    (event: KeyboardEvent<Element>): void;
}

export interface BindingInformation {
    key: string;
    onDown?: KeyAction;
    onUp?: KeyAction;
    whileDown?: KeyAction;
    onShift?: boolean,
    onControl?: boolean,
    onAlt?: boolean
}

export class KeyBinding {
    key: string;
    onDown?: KeyAction;
    onUp?: KeyAction;
    whileDown?: KeyAction;
    onShift: boolean = false;
    onControl: boolean = false;
    onAlt: boolean = false;

    constructor(bindingInfo: BindingInformation) {
        this.key = bindingInfo.key;
        this.onDown = bindingInfo.onDown;
        this.whileDown = bindingInfo.whileDown;
        this.onUp = bindingInfo.onUp

        this.onShift = bindingInfo.key === 'Shift' ? true : (bindingInfo.onShift ?? false);
        this.onControl = bindingInfo.key === 'Control' ? true : (bindingInfo.onControl ?? false);
        this.onAlt = bindingInfo.key === 'Alt' ? true : (bindingInfo.onAlt ?? false);
    }

    runWhileDown(event: KeyboardEvent) {
        if (this.testDown(event)) {
            this.whileDown?.(event);
        }
    }
  
    testDown(event: KeyboardEvent<Element>)  {
        return this.onDown !== null && this.onDown !== undefined
        && event.type == 'keydown' && (event.key == this.key || this.key == 'any')
        && this.onShift == event.shiftKey && this.onControl == event.ctrlKey
        && this.onAlt == event.altKey
    }

    runDown(event: KeyboardEvent<Element>) {
        if (this.onDown !== null && this.onDown !== undefined) {
            this.onDown(event)
        }
    }

    testAndRunDown(event: KeyboardEvent<Element>) {
        if (this.testDown(event)) {
            this.runDown(event)
        }
    }

    testUp(event: KeyboardEvent<Element>) {
        return this.onUp !== null && this.onUp !== undefined
        && event.type == 'keyup' && (event.key == this.key || this.key == 'any') 
        //  && (this.onShift ? this.onShift != event.shiftKey : this.onShift == event.shiftKey)
        //  && (this.onControl ? this.onControl != event.ctrlKey : this.onControl == event.ctrlKey)
        //  && (this.onAlt ? this.onAlt != event.altKey : this.onAlt == event.altKey)
    }

    runUp(event: KeyboardEvent<Element>) {
        if (this.onUp !== null && this.onUp !== undefined) {
            this.onUp(event)
        }
    }
  
    testAndRunUp(event: KeyboardEvent<Element>) {
        if (this.testUp(event)) {
            // console.log(event)
            this.runUp(event)
        }
    }

  }