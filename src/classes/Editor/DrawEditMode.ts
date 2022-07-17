import { PointerEvent } from "react";
import { EditMode } from "./EditMode";

export class DrawEditMode implements EditMode {


    constructor() { }

    onModeStart(): void {
        throw new Error("Method not implemented.");
    }
    onModeEnd(): void {
        throw new Error("Method not implemented.");
    }

    onPointerDown(event: PointerEvent<Element>) {
        
    }
    
    onPointerUp(event: PointerEvent<Element>) {

    }
    
    onPointerMove(event: PointerEvent<Element>) {

    }

}