import { KeyBinding } from "./KeyBinding";
import { KeyboardEvent } from "react";

export class KeyHandler {
    bindings: KeyBinding[];
    downedKeys: KeyboardEvent<Element>[] = [];

    constructor(bindings: KeyBinding[] = []) {
        this.bindings = bindings;
    }

    callDownedBindings() {
        this.downedKeys.forEach(event => this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runDown(event)));
    }

    onKeyDown(event: KeyboardEvent<Element>) {
        console.log(this.downedKeys.map(key => key.key).toString());
        if (!this.downedKeys.some(key => key.key === event.key)) {
            this.downedKeys.push(event);
        }
        
        this.bindings.filter(binding => binding.testDown(event)).forEach(successfulBinding => successfulBinding.runDown(event));
    }

    onKeyUp(event: KeyboardEvent<Element>) {
        this.downedKeys = this.downedKeys.filter(downed => downed.key !== event.key);
        this.bindings.filter(binding => binding.testUp(event)).forEach(successfulBinding => successfulBinding.runUp(event));
    }
}