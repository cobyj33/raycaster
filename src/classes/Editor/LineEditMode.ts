import { PointerEvent } from "react";
import { LineSegment } from "../Data/LineSegment";
import { Vector2 } from "../Data/Vector2";
import { WallTile } from "../Tiles/WallTile";
import { EditMode } from "./EditMode";
import { EditorData } from "./EditorData";

export class LineEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: Vector2 | undefined;
    end: Vector2 | undefined;
    get cells(): Vector2[] {
        if (this.start !== undefined && this.end !== undefined) {
            return new LineSegment(this.start, this.end).toCells();
        }
        return []
    }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.getHoveredCell(event);
        this.end = this.start.clone();
    }

    onPointerMove(event: PointerEvent<Element>) {
        if (this.data.isPointerDown && this.start !== undefined && this.end !== undefined) {
            const hoveredCell = this.data.getHoveredCell(event);
            if (!this.end.equals(hoveredCell)) {
                const toRemove = new Set<string>(this.cells.map(cell => JSON.stringify(cell)));
                const [ghostTilePositions, setGhostTilePositions] = this.data.ghostTilePositions;
                setGhostTilePositions( positions => positions.filter( cell => !toRemove.has(JSON.stringify(cell)) ) )
                this.end = hoveredCell.clone();
                setGhostTilePositions( positions => positions.concat( this.cells ) )
            }
        }
    }

    onPointerUp(event: PointerEvent<Element>) {
        if (this.data.isPointerDown && this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;
            new LineSegment(this.start, this.end).toCells().forEach(cell => {
            if (map.inBounds(cell.row, cell.col)) {
                setMap((map) => map.placeTile(this.data.selectedTile.clone(), cell.row, cell.col))
            }});

            const [ghostTilePositions, setGhostTilePositions] = this.data.ghostTilePositions;
            const toRemove = new Set<string>(new LineSegment(this.start, this.end).toCells().map(cell => JSON.stringify(cell)));
            setGhostTilePositions( positions => positions.filter( cell =>  !toRemove.has(JSON.stringify(cell)) ) )
        }
        this.start = undefined;
        this.end = undefined
    }

}