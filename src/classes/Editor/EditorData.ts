import { PointerEvent } from "react";
import { Tile, StatefulData, View, GameMap, IVector2 } from "raycaster/interfaces"

export interface EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    lastHoveredCell: IVector2;
    isPointerDown: boolean;
    getHoveredCell: (event: PointerEvent<Element>) => IVector2;
    selectedTile: Tile;
    ghostTilePositions: StatefulData<IVector2[]>
}
