import { KeyboardEvent, PointerEvent } from "react";
import { EditMode } from "raycaster/editor";
import { LineSegment, Tile, Vector2, gameMapInBounds } from "raycaster/interfaces"
import { getLine, removeDuplicates } from "raycaster/functions";

function getBoxCorners(start: Vector2, end: Vector2): LineSegment[] {
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
    start: Vector2 | undefined;
    end: Vector2 | undefined;
    boxLocked: boolean = false;
    private get currentBox(): LineSegment[] {
        if (this.start !== undefined && this.end !== undefined) {
            return getBoxCorners(this.start, this.end);
        }

        return []
    };

    private get boxCells(): Vector2[] { return removeDuplicates(this.currentBox.flatMap(line => getLine(line.start, line.end))) ?? [] }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.getHoveredCell(event);
        this.end = {...this.start };
    }

    onPointerMove(event: PointerEvent<Element>) {
        if (this.data.isPointerDown === false || this.start === undefined || this.end === undefined) return;

        const hoveredCell = this.data.getHoveredCell(event);
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
                // this.end = this.start.add( new Vector2( hoveredCell.row < this.start.row ? -sideLength : sideLength, hoveredCell.col < this.start.col ? -sideLength : sideLength ) )
            } else {
                this.end = hoveredCell;
            }

            setGhostTilePositions( positions => positions.concat( this.boxCells ) )
        }
    }

    onPointerUp() {

        console.log(this.start, this.end);
        if (this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;

            const tiles: Tile[][] = [...map.tiles];
            this.boxCells.filter(cell => gameMapInBounds(map, cell.row, cell.col)).forEach(cell => tiles[cell.row][cell.col] = {...this.data.selectedTile});
            setMap(map => ({...map, tiles: tiles}));

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
