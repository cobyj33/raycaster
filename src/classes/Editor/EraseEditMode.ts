import { PointerEvent } from "react";
import { LineSegment } from "../Data/LineSegment";
import { EmptyTile } from "../Tiles/EmptyTile";
import { EditMode } from "./EditMode";

export class EraseEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/material-rounded/24/00000/eraser.png"), crosshair' }
    
    onPointerDown(event: PointerEvent<Element>) {
        const [map, setMap] = this.data.mapData;
        const hoveredCell = this.data.getHoveredCell(event);
        if (this.data.isPointerDown) {
            if (map.inBounds(hoveredCell.row, hoveredCell.col)) {
                setMap((map) => map.placeTile(new EmptyTile(), hoveredCell.row, hoveredCell.col))
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
                setMap((map) => map.placeTile(new EmptyTile(), cell.row, cell.col))
            }});
        }
    }

}