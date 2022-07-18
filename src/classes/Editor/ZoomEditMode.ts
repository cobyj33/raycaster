import { KeyboardEvent, PointerEvent } from "react";
import { Vector2 } from "../Data/Vector2";
import { EditMode } from "./EditMode";

export class ZoomEditMode extends EditMode {
    zoomDirection: Vector2 = new Vector2(-1, -1);
    cursor() { return 'url("https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/000000/external-magnifying-glass-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png"), nwse-resize' }

    onPointerMove(event: PointerEvent<Element>) {
        const [view, setView] = this.data.viewData;
        if (this.data.isPointerDown === true) {
        const movementVector: Vector2 = new Vector2(event.movementY, event.movementX);
        if (movementVector.length > 0) {
            setView(view.withCellSize( Math.max(2, view.cellSize + Math.trunc(Vector2.dotProduct(this.zoomDirection, movementVector.normalized()  )) )  ));
            }
        }
    }

    
}