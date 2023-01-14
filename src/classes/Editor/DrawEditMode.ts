import {getLine} from "raycaster/functions";
import { Tile, GameMap, IVector2 } from "raycaster/interfaces";
import { PointerEvent } from "react";
import { EditMode } from "classes/Editor/EditMode";

export class DrawEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }

    private tryPlaceCell({row, col}: IVector2) {
        const [map, setMap] = this.data.mapData;
        if (map.inBounds(row, col)) {
            setMap((map: GameMap) => map.set(row, col, this.data.selectedTile));
        }
    }

    onPointerDown(event: PointerEvent<Element>) {
        const hoveredCell = this.data.currentHoveredCell;
        if (this.data.isPointerDown) {
            this.tryPlaceCell(hoveredCell);
        }
    }

    onPointerMove(event: PointerEvent<Element>) {
        const [map, setMap] = this.data.mapData;
        const hoveredCell = this.data.currentHoveredCell;
        const lastHoveredCell = this.data.lastHoveredCell;
        if (this.data.isPointerDown) {
            const placementData = getLine(lastHoveredCell, hoveredCell).filter(cell => map.inBoundsVec2(cell)).map(cell => ({ position: cell, tile: this.data.selectedTile}) )
            setMap(map => map.setTiles(placementData))
        }
    }
}
