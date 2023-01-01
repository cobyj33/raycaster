import { PointerEvent } from "react";
import { IVector2, getVectorLength, dotProductVector2, vector2Normalized } from "raycaster/interfaces";
import { EditMode } from "classes/Editor/EditMode";

const ZOOM_DIRECTION: IVector2 = { row: -1, col: -1 }

export class ZoomEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/000000/external-magnifying-glass-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png"), nwse-resize' }

    onPointerMove(event: PointerEvent<Element>) {
        const [,setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
            const movementVector: IVector2 = { row: event.movementY, col: event.movementX };
            if (getVectorLength(movementVector) !== 0) {
                setView( view =>  ({
                    ...view, 
                    cellSize: Math.max(2, view.cellSize + Math.trunc(dotProductVector2(ZOOM_DIRECTION, vector2Normalized(movementVector))))
                }) ) 
                // setView(view.withCellSize( Math.max(2, view.cellSize + Math.trunc(IVector2.dotProduct(this.zoomDirection, movementVector.normalized()  )) )  ));
                }
        }
    }

    
}
