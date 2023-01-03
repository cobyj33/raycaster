import { PointerEvent } from "react";
import { IVector2, getVectorLength, dotProductVector2, vector2Normalized, Vector2 } from "raycaster/interfaces";
import { EditMode } from "classes/Editor/EditMode";

const ZOOM_DIRECTION: Vector2 = new Vector2(-1, -1)

export class ZoomEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/000000/external-magnifying-glass-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png"), nwse-resize' }

    onPointerMove(event: PointerEvent<Element>) {
        const [,setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
            const movementVector: Vector2 = new Vector2(event.movementY, event.movementX);
            if (getVectorLength(movementVector) !== 0) {
                setView(view =>  view.withCellSize(Math.max(2, view.cellSize + ZOOM_DIRECTION.dot(movementVector.normalize()))) )
            }
        }   
    }

    
}
