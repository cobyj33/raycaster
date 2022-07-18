import { PointerEvent } from "react";
import { LineSegment } from "../Data/LineSegment";
import { WallTile } from "../Tiles/WallTile";
import { EditMode } from "./EditMode";
import { EditorData } from "./EditorData";

export class DrawEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }

    onPointerDown(event: PointerEvent<Element>) {
        const [map, setMap] = this.data.mapData;
        const hoveredCell = this.data.getHoveredCell(event);
        if (this.data.isPointerDown) {
            if (map.inBounds(hoveredCell.row, hoveredCell.col)) {
                setMap((map) => map.placeTile(this.data.selectedTile.clone(), hoveredCell.row, hoveredCell.col))
            }
        }
    }

    onPointerMove(event: PointerEvent<Element>) {
        const [map, setMap] = this.data.mapData;
        const hoveredCell = this.data.getHoveredCell(event);
        const lastHoveredCell = this.data.lastHoveredCell;
        if (this.data.isPointerDown) {
            console.log(new LineSegment(lastHoveredCell, hoveredCell).toCells());
            new LineSegment(lastHoveredCell, hoveredCell).toCells().forEach(cell => {
            if (map.inBounds(cell.row, cell.col)) {
                setMap((map) => map.placeTile(this.data.selectedTile.clone(), cell.row, cell.col))
            }});
        }
    }

}