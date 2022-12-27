import {getLine} from "raycaster/functions";
import { Tile, GameMap, gameMapInBounds, IVector2 } from "raycaster/interfaces";
import { PointerEvent } from "react";
import { EditMode } from "./EditMode";

export class DrawEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }

    private tryPlaceCell({row, col}: IVector2) {
        const [map, setMap] = this.data.mapData;
        if (gameMapInBounds(map, row, col)) {
            const tiles: Tile[][] = [...map.tiles];
            tiles[row][col] = {...this.data.selectedTile}
            setMap((map: GameMap) => ({ ...map, tiles: tiles}));
        }
    }

    onPointerDown(event: PointerEvent<Element>) {
        const hoveredCell = this.data.getHoveredCell(event);
        if (this.data.isPointerDown) {
            this.tryPlaceCell(hoveredCell);
        }
    }

    onPointerMove(event: PointerEvent<Element>) {
        const hoveredCell = this.data.getHoveredCell(event);
        const lastHoveredCell = this.data.lastHoveredCell;
        if (this.data.isPointerDown) {
            getLine(lastHoveredCell, hoveredCell).forEach(cell => {
                this.tryPlaceCell(cell);
            });
        }
    }
}
