import { KeyBinding } from "./KeyBinding";
import { KeyboardEvent, MutableRefObject, useEffect, useRef } from "react";
import { NakedKeyEvent } from "./NakedKeyEvent";

export class KeyHandler {
    bindings: KeyBinding[];
    downedKeys: KeyboardEvent<Element>[] = [];

    constructor(bindings: KeyBinding[] = []) {
        this.bindings = bindings;
    }

    callDownedBindings() {
        if (this.downedKeys.length === 0) return;
        this.downedKeys.forEach(event => this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runWhileDown(event)));
    }

    onKeyDown(event: KeyboardEvent<Element>) {
        console.log('valid events: ' + this.bindings.filter(binding => binding.testDown(event)).length);
        if (!this.downedKeys.some(key => key.code === event.code)) {
            this.downedKeys.push(event);
        }
        
        this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runDown(event));
    }

    onKeyUp(event: KeyboardEvent<Element>) {
        console.log(event);
        this.downedKeys = this.downedKeys.filter(downed => downed.code !== event.code);
        this.bindings.filter(binding => binding.testUp(event)).forEach(successfulBinding => successfulBinding.runUp(event));
    }
}

export function useKeyHandler(handler: KeyHandler, refreshRate: number = 1 / 30): MutableRefObject<KeyHandler> {
    const keyHandler: MutableRefObject<KeyHandler> = useRef<KeyHandler>(handler);

    const loopInProgress = useRef(false);
    function movementLoop() {
        keyHandler.current.callDownedBindings();
        setTimeout( () => requestAnimationFrame(movementLoop), refreshRate);
    }

    useEffect( () => {
        if (loopInProgress.current === false) {
            loopInProgress.current = true;
            setTimeout( () => requestAnimationFrame(movementLoop), refreshRate);
        }
    }, [])

    return keyHandler
}