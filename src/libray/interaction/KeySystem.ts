import React from 'react';

interface NakedKeyEvent {
    code: string,
    type?: string
    shiftKey?: boolean | undefined,
    altKey?: boolean | undefined,
    ctrlKey?: boolean | undefined,
}


interface KeyAction {
    (event: React.KeyboardEvent<Element>): void;
}

interface BindingInformation {
    code: string;
    onDown?: KeyAction;
    onUp?: KeyAction;
    whileDown?: KeyAction;
    onShift?: boolean,
    onControl?: boolean,
    onAlt?: boolean
}

type KeyData = Pick<React.KeyboardEvent<Element>, "altKey" | "metaKey" | "shiftKey" | "code">



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

    runWhileDown(event: React.KeyboardEvent<Element>) {
        if (this.testDown(event)) {
            this.whileDown?.(event);
        }
    }
  
    testDown(event: React.KeyboardEvent<Element>)  {
        return this.onDown !== null && this.onDown !== undefined
        && event.type == 'keydown' && (event.code == this.details.code || this.details.code == 'any')
        && (this.details.shiftKey === event.shiftKey || this.details.shiftKey === undefined)
        && (this.details.ctrlKey == event.ctrlKey || this.details.ctrlKey === undefined)
        && (this.details.altKey == event.altKey || this.details.altKey === undefined)
    }

    runDown(event: React.KeyboardEvent<Element>) {
        if (this.onDown !== null && this.onDown !== undefined) {
            this.onDown(event)
        }
    }

    testAndRunDown(event: React.KeyboardEvent<Element>) {
        if (this.testDown(event)) {
            this.runDown(event)
        }
    }

    testUp(event: React.KeyboardEvent<Element>) {
        return this.onUp !== null && this.onUp !== undefined
        && event.type == 'keyup' && (event.code == this.details.code || this.details.code == 'any') 
    }

    runUp(event: React.KeyboardEvent<Element>) {
        if (this.onUp !== null && this.onUp !== undefined) {
            this.onUp(event)
        }
    }
  
    testAndRunUp(event: React.KeyboardEvent<Element>) {
        if (this.testUp(event)) {
            this.runUp(event)
        }
    }
}

export class KeyHandler {
    bindings: KeyBinding[];
    downedKeys: React.KeyboardEvent<Element>[] = [];

    constructor(bindings: KeyBinding[] = []) {
        this.bindings = bindings;
    }

    setBindings(bindings: KeyBinding[]) {
        this.bindings = bindings
    }

    callDownedBindings() {
        if (this.downedKeys.length === 0) return;
        this.downedKeys.forEach(event => this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runWhileDown(event)));
    }

    onKeyDown(event: React.KeyboardEvent<Element>) {
        if (!this.downedKeys.some(key => key.code === event.code)) {
            this.downedKeys.push(event);
        }
        
        this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runDown(event));
    }

    onKeyUp(event: React.KeyboardEvent<Element>) {
        this.downedKeys = this.downedKeys.filter(downed => downed.code !== event.code);
        this.bindings.filter(binding => binding.testUp(event)).forEach(successfulBinding => successfulBinding.runUp(event));
    }
}

export function useKeyHandler(handler: KeyHandler, refreshRate: number = 1 / 30): React.MutableRefObject<KeyHandler> {
    const keyHandler: React.MutableRefObject<KeyHandler> = React.useRef<KeyHandler>(handler);

    const loopInProgress = React.useRef(false);
    const movementLoop = React.useCallback( () => {
        if (loopInProgress.current) {
            keyHandler.current.callDownedBindings();
            setTimeout( () => requestAnimationFrame(movementLoop), refreshRate);
        }
    }, [])

    React.useEffect( () => {
        if (loopInProgress.current === false) {
            loopInProgress.current = true;
            setTimeout( () => requestAnimationFrame(movementLoop), refreshRate);
        }
        return () => { loopInProgress.current = false }
    }, [])

    return keyHandler
}

