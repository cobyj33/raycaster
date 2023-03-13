import { KeyboardEvent, PointerEvent } from "react";
import { EditMode } from "classes/Editor/EditMode";
import { IVector2, getEllipse } from "jsutil";


export class EllipseEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: IVector2 | undefined;
    end: IVector2 | undefined;
    circleLocked: boolean = false;

    get currentCells(): IVector2[] {
        if (this.start !== undefined && this.start !== null && this.end !== undefined && this.end !== null) {
            return getEllipse(this.start, this.end);
        }
        return []
    }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.currentHoveredCell;
        this.end = { ...this.start };
    }

    onPointerMove(event: PointerEvent<Element>) {

        if (this.data.isPointerDown === false || this.start === undefined || this.start === null || this.end === undefined || this.end === null) return;

        const hoveredCell = this.data.currentHoveredCell;
        if (!(this.end.row === hoveredCell.row && this.end.col === hoveredCell.col)) {
            const toRemove = new Set<string>(this.currentCells.map(cell => JSON.stringify(cell)));
            const [, setGhostTilePositions] = this.data.ghostTilePositions;
            setGhostTilePositions( positions => positions.filter( cell => !toRemove.has(JSON.stringify(cell)) ) )
            
            if (this.circleLocked) {
                const sideLength: number = Math.min(Math.abs(hoveredCell.row - this.start.row), Math.abs(hoveredCell.col - this.start.col));

                this.end = {
                    row: this.start.row + ( hoveredCell.row < this.start.row ? -sideLength : sideLength ),
                    col: this.start.col + ( hoveredCell.col < this.start.col ? -sideLength : sideLength )       
                }

                // this.end = this.start.add( new IVector2( hoveredCell.row < this.start.row ? -sideLength : sideLength, hoveredCell.col < this.start.col ? -sideLength : sideLength ) )
            } else {
                this.end = hoveredCell;
            }

            setGhostTilePositions( positions => positions.concat( this.currentCells ) )
        }
    }

    onPointerUp() {
        if (this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;

            // this.currentCells.filter(cell => map.inBo(map, cell.row, cell.col)).forEach(cell => tiles[cell.row][cell.col] = {...this.data.selectedTile});
            // setMap(map => ({...map, tiles: tiles}));
            const newTiles = this.currentCells.filter(cell => map.inBoundsVec2(cell)).map(cell => ( { position: cell, tile: this.data.selectedTile} ));
            setMap(map => map.setTiles(newTiles));

            const [,setGhostTilePositions] = this.data.ghostTilePositions;
            const toRemove = new Set<string>(this.currentCells.map(cell => JSON.stringify(cell)));
            setGhostTilePositions( positions => positions.filter( cell =>  !toRemove.has(JSON.stringify(cell)) ) )
        }
        this.start = undefined;
        this.end = undefined;
        this.circleLocked = false;
    }

    onKeyDown(event: KeyboardEvent<Element>) {
        if (event.code === "ShiftLeft") {
            this.circleLocked = true;
        }
    }

    onKeyUp(event: KeyboardEvent<Element>) {
        if (event.code === "ShiftLeft") {
            this.circleLocked = false;
        }
    }
}
