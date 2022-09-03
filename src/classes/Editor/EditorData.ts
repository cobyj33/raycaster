import { PointerEvent } from "react";
import { Tile, StatefulData, View, GameMap, Vector2 } from "raycaster/interfaces"

export interface EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    lastHoveredCell: Vector2;
    isPointerDown: boolean;
    getHoveredCell: (event: PointerEvent<Element>) => Vector2;
    selectedTile: Tile;
    ghostTilePositions: StatefulData<Vector2[]>
}
