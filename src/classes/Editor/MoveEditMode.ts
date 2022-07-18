import React, { PointerEvent } from "react";
import { Vector2 } from "../Data/Vector2";
import { View } from "../Data/View";
import { EditMode } from "./EditMode";

export class MoveEditMode extends EditMode{
    cursor() { return 'move' }
     
    onPointerMove(event: PointerEvent<Element>) {
        const [view, setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
            const movementDirection: Vector2 = new Vector2(event.movementY, event.movementX);
            if (movementDirection.length !== 0) {
                setView(view => view.withCoordinates( view.coordinates.add(movementDirection.toLength(20 / view.cellSize)) ));
            }
        }
    }
}