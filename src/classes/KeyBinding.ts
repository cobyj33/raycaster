import {KeyboardEvent} from 'react';

interface KeyAction {
    (event: KeyboardEvent<Element>): void;
}

export class KeyBinding {
    onDown: KeyAction;
    onUp: KeyAction;
    key: string;
    onShift: boolean;
    onControl: boolean;
    onAlt: boolean;

    constructor({key, onDown = (event) => console.log('key pressed'), onUp = (event) => console.log('key lifted'), onShift = false, onControl = false, onAlt = false}: 
    { key: string, onDown?: KeyAction, onUp?: KeyAction, onShift?: boolean, onControl?: boolean, onAlt?: boolean}) {
        this.onDown = onDown;
        this.onUp = onUp
        this.key = key;
        this.onShift = key === 'Shift' ? true : onShift;
        this.onControl = key === 'Control' ? true : onControl;
        this.onAlt = key === 'Alt' ? true : onAlt;
    }
  
    testDown(event: KeyboardEvent<Element>) {
        console.log(event.type);
        console.log(event.key, this.key);
        return event.type == 'keydown' && (event.key == this.key || this.key == 'any') && this.onShift == event.shiftKey && this.onControl == event.ctrlKey && this.onAlt == event.altKey
    }

    runDown(event: KeyboardEvent<Element>) {
        this.onDown(event)
    }

    testAndRunDown(event: KeyboardEvent<Element>) {
        if (this.testDown(event)) {
            this.runDown(event)
        }
    }

    testUp(event: KeyboardEvent<Element>) {
        return event.type == 'keyup' && (event.key == this.key || this.key == 'any') 
         && (this.onShift ? this.onShift != event.shiftKey : this.onShift == event.shiftKey)
         && (this.onControl ? this.onControl != event.ctrlKey : this.onControl == event.ctrlKey)
         && (this.onAlt ? this.onAlt != event.altKey : this.onAlt == event.altKey)
    }

    runUp(event: KeyboardEvent<Element>) {
        this.onUp(event)
    }
  
    testAndRunUp(event: KeyboardEvent<Element>) {
        if (this.testUp(event)) {
            // console.log(event)
            this.runUp(event)
        }
    }
  }