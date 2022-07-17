import { throws } from "assert";
import { StatefulData } from "../../interfaces/StatefulData";
import { Vector2 } from "../Data/Vector2";
import { View } from "../Data/View";
import { GameMap } from "../GameMap";

export class EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    lastHoveredCell: Vector2;
    isPointerDown: boolean;

    constructor(mapData: StatefulData<GameMap>, viewData: StatefulData<View>, lastHoveredCell: Vector2, isPointerDown: boolean) {
        this.mapData = mapData;
        this.viewData = viewData;
        this.lastHoveredCell = lastHoveredCell;
        this.isPointerDown = isPointerDown;
    }

    withMapData(mapData: StatefulData<GameMap>) {
        
    }

    
}