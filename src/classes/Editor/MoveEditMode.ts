import { PointerEvent } from "react";
import { Vector2, getVectorLength } from "interfaces/Vector2"
import { EditMode } from "classes/Editor/EditMode";

const MOVE_SPEED = 20;
export class MoveEditMode extends EditMode{
    cursor() { return 'move' }
     
    onPointerMove(event: PointerEvent<Element>) {
        const [, setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
            const movementVector: Vector2 = new Vector2(event.movementY, event.movementX);
            if (getVectorLength(movementVector) !== 0) {
                setView(view => view.withPosition(view.position.add(movementVector.toLength( MOVE_SPEED / view.cellSize ))) )
            }
        }
    }
}
