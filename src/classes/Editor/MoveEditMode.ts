import { PointerEvent } from "react";
import { IVector2, addVector2, vector2ToLength, getVectorLength } from "raycaster/interfaces"
import { EditMode } from "raycaster/editor";

const MOVE_SPEED = 20;
export class MoveEditMode extends EditMode{
    cursor() { return 'move' }
     
    onPointerMove(event: PointerEvent<Element>) {
        const [, setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
            const movementVector: IVector2 = { row: event.movementY, col: event.movementX };
            if (getVectorLength(movementVector) !== 0) {
                setView(view => ({ ...view, ...addVector2(view, vector2ToLength(movementVector, MOVE_SPEED / view.cellSize))}));
            }
        }
    }
}
