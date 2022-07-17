import React, { PointerEvent } from "react";
import { Vector2 } from "../Data/Vector2";
import { View } from "../Data/View";
import { EditMode } from "./EditMode";

export class MoveEditMode implements EditMode{
    // setView: React.Dispatch<React.SetStateAction<View>>;
    // isPointerDown: boolean = false;

    // constructor() {
    //     this.setView = setView;
    // }

    onModeEnd(): void {
        
    }

    onModeStart(): void {
        
    }

    // onPointerDown(event: PointerEvent<Element>) {
    //     this.isPointerDown = true;
    // }
    
    // onPointerUp(event: PointerEvent<Element>) {
    //     this.isPointerDown = false;
    // }
    
    // onPointerMove(event: PointerEvent<Element>) {
    //     if (this.isPointerDown) {
    //         const movementDirection: Vector2 = new Vector2(event.movementY, event.movementX);
    //         this.setView(view => view.withCoordinates( view.coordinates.add(movementDirection) ));
    //     }
    // }

}