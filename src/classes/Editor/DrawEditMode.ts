import {getLine} from "functions/shape";
import { Tile } from "interfaces/Tile"
import { GameMap } from "interfaces/GameMap";
import { IVector2 } from "interfaces/Vector2";
import { PointerEvent } from "react";
import { EditMode, EditorData } from "classes/Editor/EditMode";

function tryPlaceCell({row, col}: IVector2, data: EditorData, tile: Tile) {
    const [map, setMap] = data.mapData;
    if (map.inBounds(row, col)) {
        setMap((map: GameMap) => map.set(row, col, tile));
    }
}

export function onPlacePointerDown(data: EditorData, tile: Tile) {
    const hoveredCell = data.currentHoveredCell;
    if (data.isPointerDown) {
        tryPlaceCell(hoveredCell, data, tile);
    }
}

export function onPlacePointerMove(data: EditorData, tile: Tile) {
    const [map, setMap] = data.mapData;
    const hoveredCell = data.currentHoveredCell;
    const lastHoveredCell = data.lastHoveredCell;
    if (data.isPointerDown) {
        const placementData = getLine(lastHoveredCell, hoveredCell).filter(cell => map.inBoundsVec2(cell)).map(cell => ({ position: cell, tile: tile}) )
        setMap(map => map.setTiles(placementData))
    }
}

export class DrawEditMode extends EditMode {
    // cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    cursor() { return '' }

    onPointerDown(event: PointerEvent<Element>) {
        onPlacePointerDown(this.data, this.data.selectedTile)
    }

    onPointerMove(event: PointerEvent<Element>) {
        onPlacePointerMove(this.data, this.data.selectedTile)
    }
}
