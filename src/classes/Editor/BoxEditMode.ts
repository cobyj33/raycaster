import { KeyboardEvent, PointerEvent } from "react";
import { removeDuplicates } from "../../functions/utilityFunctions";
import { LineSegment } from "../Data/LineSegment";
import { Vector2 } from "../Data/Vector2";
import { WallTile } from "../Tiles/WallTile";
import { EditMode } from "./EditMode";
import { EditorData } from "./EditorData";

export class BoxEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: Vector2 | undefined;
    end: Vector2 | undefined;
    boxLocked: boolean = false;
    private get currentBox(): LineSegment[] {
        if (this.start !== undefined && this.end !== undefined) {
            return this.box(this.start, this.end);
        }
        return []
    };

    private get boxCells(): Vector2[] { return removeDuplicates(this.currentBox.flatMap(line => line.toCells())) ?? [] }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.getHoveredCell(event);
        this.end = this.start.clone();
    }

    onPointerMove(event: PointerEvent<Element>) {
        if (this.data.isPointerDown && this.start !== undefined && this.end !== undefined) {
            const hoveredCell = this.data.getHoveredCell(event);
            if (!this.end.equals(hoveredCell)) {
                const toRemove = new Set<string>(this.boxCells.map(cell => JSON.stringify(cell)));
                const [ghostTilePositions, setGhostTilePositions] = this.data.ghostTilePositions;
                setGhostTilePositions( positions => positions.filter( cell => !toRemove.has(JSON.stringify(cell)) ) )

                if (this.boxLocked) {
                    const sideLength: number = Math.min(Math.abs(hoveredCell.row - this.start.row), Math.abs(hoveredCell.col - this.start.col));
                    this.end = this.start.add( new Vector2( hoveredCell.row < this.start.row ? -sideLength : sideLength, hoveredCell.col < this.start.col ? -sideLength : sideLength ) )
                } else {
                    this.end = hoveredCell.clone();
                }

                setGhostTilePositions( positions => positions.concat( this.boxCells ) )
            }
        }
    }

    onPointerUp(event: PointerEvent<Element>) {
        console.log(this.start, this.end);
        if (this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;
            console.log('box cell count:' + this.boxCells.length);
            this.boxCells.forEach(cell => {
                if (map.inBounds(cell.row, cell.col)) {
                    setMap((map) => map.placeTile(this.data.selectedTile.clone(), cell.row, cell.col))
                } 
            })

            const [ghostTilePositions, setGhostTilePositions] = this.data.ghostTilePositions;
            const toRemove = new Set<string>(this.boxCells.map(cell => JSON.stringify(cell)));
            setGhostTilePositions( positions => positions.filter( cell =>  !toRemove.has(JSON.stringify(cell)) ) )
        }
        this.start = undefined;
        this.end = undefined;
    }

    box(start: Vector2, end: Vector2): LineSegment[] {
        const firstCorner = new Vector2(start.row, end.col);
        const secondCorner = new Vector2(end.row, start.col);
        return [new LineSegment(start, firstCorner), new LineSegment(firstCorner, end), new LineSegment(end, secondCorner), new LineSegment(secondCorner, start)];
    }

    onKeyDown(event: KeyboardEvent<Element>) {
        if (event.code === "ShiftLeft") {
            this.boxLocked = true;
        }
    }

    onKeyUp(event: KeyboardEvent<Element>) {
        if (event.code === "ShiftLeft") {
            this.boxLocked = false;
        }
    }

}
