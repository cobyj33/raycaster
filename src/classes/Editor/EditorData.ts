import { throws } from "assert";
import { StatefulData } from "../../interfaces/StatefulData";
import { Vector2 } from "../Data/Vector2";
import { View } from "../Data/View";
import { GameMap } from "../GameMap";
import { PointerEvent } from "react";
import { Tile } from "../../interfaces/Tile";
export interface EditorData {
    mapData: StatefulData<GameMap>;
    viewData: StatefulData<View>;
    lastHoveredCell: Vector2;
    isPointerDown: boolean;
    getHoveredCell: (event: PointerEvent<Element>) => Vector2;
    selectedTile: Tile;
}