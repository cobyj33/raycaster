import { KeyboardEvent, PointerEvent } from "react";
import { EditMode } from "classes/Editor/EditMode";
import { ILineSegment, IVector2, getLine, removeDuplicatesGeneric } from "jsutil";

function getBoxCorners(start: IVector2, end: IVector2): ILineSegment[] {
    const firstCorner = { row: start.row, col: end.col }
    const secondCorner = {row: end.row, col: start.col }
    return [
        {start: start, end: firstCorner },
        {start: firstCorner, end: end },
        {start: end, end: secondCorner },
        {start: secondCorner, end: start }
    ];
}

export class BoxEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: IVector2 | undefined;
    end: IVector2 | undefined;
    boxLocked: boolean = false;
    private get currentBox(): ILineSegment[] {
        if (this.start !== undefined && this.end !== undefined) {
            return getBoxCorners(this.start, this.end);
        }

        return []
    };

    private get boxCells(): IVector2[] { return removeDuplicatesGeneric(this.currentBox.flatMap(line => getLine(line.start, line.end))) ?? [] }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.currentHoveredCell;
        this.end = {...this.start };
    }

    onPointerMove(event: PointerEvent<Element>) {
        if (this.data.isPointerDown === false || this.start === undefined || this.end === undefined) return;

        const hoveredCell = this.data.currentHoveredCell;
        if (!( this.end.row === hoveredCell.row && this.end.col === hoveredCell.col  )) {
            const toRemove = new Set<string>(this.boxCells.map(cell => JSON.stringify(cell)));
            const { 1: setGhostTilePositions } = this.data.ghostTilePositions;
            setGhostTilePositions( positions => positions.filter( cell => !toRemove.has(JSON.stringify(cell)) ) )

            if (this.boxLocked) {
                const sideLength: number = Math.min(Math.abs(hoveredCell.row - this.start.row), Math.abs(hoveredCell.col - this.start.col));

                this.end = {
                    row: this.start.row + ( hoveredCell.row < this.start.row ? -sideLength : sideLength ),
                    col: this.start.col + ( hoveredCell.col < this.start.col ? -sideLength : sideLength )       
                }
                // this.end = this.start.add( new IVector2( hoveredCell.row < this.start.row ? -sideLength : sideLength, hoveredCell.col < this.start.col ? -sideLength : sideLength ) )
            } else {
                this.end = hoveredCell;
            }

            setGhostTilePositions( positions => positions.concat( this.boxCells ) )
        }
    }

    onPointerUp() {

        if (this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;
            const newTiles = this.boxCells.filter(cell => map.inBoundsVec2(cell)).map(cell => ( { position: cell, tile: this.data.selectedTile} ));
            setMap(map => map.setTiles(newTiles));

            const [,setGhostTilePositions] = this.data.ghostTilePositions;
            const toRemove = new Set<string>(this.boxCells.map(cell => JSON.stringify(cell)));
            setGhostTilePositions( positions => positions.filter( cell =>  !toRemove.has(JSON.stringify(cell)) ) )
        }

        this.start = undefined;
        this.end = undefined;
        this.boxLocked = false;
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
