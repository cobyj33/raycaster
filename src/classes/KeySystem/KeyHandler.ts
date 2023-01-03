import { KeyBinding } from "classes/KeySystem/KeyBinding";
import React from "react";
import { NakedKeyEvent } from "classes/KeySystem/NakedKeyEvent";

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