import { KeyboardEvent } from 'react';
import { NakedKeyEvent } from 'classes/KeySystem/NakedKeyEvent';

interface KeyAction {
    (event: KeyboardEvent<Element>): void;
}

export interface BindingInformation {
    code: string;
    onDown?: KeyAction;
    onUp?: KeyAction;
    whileDown?: KeyAction;
    onShift?: boolean,
    onControl?: boolean,
    onAlt?: boolean
}

export class KeyBinding {
    details: NakedKeyEvent;
    onDown?: KeyAction;
    onUp?: KeyAction;
    whileDown?: KeyAction;

    constructor(bindingInfo: BindingInformation) {
        this.onDown = bindingInfo.onDown;
        this.whileDown = bindingInfo.whileDown;
        this.onUp = bindingInfo.onUp
        this.details = {
            code: bindingInfo.code,
            shiftKey: bindingInfo.code.startsWith('Shift') ? true : (bindingInfo.onShift),
            ctrlKey: bindingInfo.code.startsWith('Control') ? true : (bindingInfo.onControl),
            altKey: bindingInfo.code.startsWith('Alt') ? true : (bindingInfo.onAlt)
        }
    }

    runWhileDown(event: KeyboardEvent) {
        if (this.testDown(event)) {
            this.whileDown?.(event);
        }
    }
  
    testDown(event: KeyboardEvent<Element>)  {
        return this.onDown !== null && this.onDown !== undefined
        && event.type == 'keydown' && (event.code == this.details.code || this.details.code == 'any')
        && (this.details.shiftKey === event.shiftKey || this.details.shiftKey === undefined)
        && (this.details.ctrlKey == event.ctrlKey || this.details.ctrlKey === undefined)
        && (this.details.altKey == event.altKey || this.details.altKey === undefined)
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
        && event.type == 'keyup' && (event.code == this.details.code || this.details.code == 'any') 
    }

    runUp(event: KeyboardEvent<Element>) {
        if (this.onUp !== null && this.onUp !== undefined) {
            this.onUp(event)
        }
    }
  
    testAndRunUp(event: KeyboardEvent<Element>) {
        if (this.testUp(event)) {
            this.runUp(event)
        }
    }

  }