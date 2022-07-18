import { PointerEvent } from "react";
import { LineSegment } from "../Data/LineSegment";
import { Vector2 } from "../Data/Vector2";
import { WallTile } from "../Tiles/WallTile";
import { EditMode } from "./EditMode";
import { EditorData } from "./EditorData";

export class LineEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: Vector2 | undefined;

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.getHoveredCell(event);
    }

    onPointerMove(event: PointerEvent<Element>) {
        
    }

    onPointerUp(event: PointerEvent<Element>) {
        const [map, setMap] = this.data.mapData;
        const hoveredCell = this.data.getHoveredCell(event);
        if (this.data.isPointerDown && this.start !== undefined) {
            new LineSegment(this.start, hoveredCell).toCells().forEach(cell => {
            if (map.inBounds(cell.row, cell.col)) {
                setMap((map) => map.placeTile(this.data.selectedTile.clone(), cell.row, cell.col))
            }});
        }
    }

}