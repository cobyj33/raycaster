import { PointerEvent } from "react";
import { EditMode } from "raycaster/editor";
import { IVector2 } from "raycaster/interfaces"
import { getLine } from "raycaster/functions";

export class LineEditMode extends EditMode {
    cursor() { return 'url("https://img.icons8.com/ios-glyphs/30/000000/pencil-tip.png"), crosshair' }
    start: IVector2 | undefined;
    end: IVector2 | undefined;
    get cells(): IVector2[] {
        if (this.start !== undefined && this.end !== undefined) {
            return getLine(this.start, this.end); 
        }
        return []
    }

    onPointerDown(event: PointerEvent<Element>) {
        this.start = this.data.getHoveredCell(event);
        this.end = { ...this.start }
    }

    onPointerMove(event: PointerEvent<Element>) {
        if (this.data.isPointerDown && this.start !== undefined && this.end !== undefined) {
            const hoveredCell = this.data.getHoveredCell(event);
            if (!(this.end.row === hoveredCell.row && this.end.col === hoveredCell.col)) {
                const toRemove = new Set<string>(this.cells.map(cell => JSON.stringify(cell)));
                const [, setGhostTilePositions] = this.data.ghostTilePositions;
                setGhostTilePositions( positions => positions.filter( cell => !toRemove.has(JSON.stringify(cell)) ) )
                this.end = hoveredCell;
                setGhostTilePositions( positions => positions.concat( this.cells ) )
            }
        }
    }

    onPointerUp(event: PointerEvent<Element>) {
        if (this.start !== undefined && this.end !== undefined) {
            const [map, setMap] = this.data.mapData;
            const newCells: IVector2[] = getLine(this.start, this.end).filter(cell => map.inBoundsVec2(cell));

            // const tiles: Tile[][] = [...map.tiles];
            // newCells.forEach(cell => tiles[cell.row][cell.col] = {...this.data.selectedTile});
            // setMap(map => ({...map, tiles: tiles}));
            const newTiles = newCells.filter(cell => map.inBoundsVec2(cell)).map(cell => ( { position: cell, tile: this.data.selectedTile} ));
            setMap(map => map.setTiles(newTiles));

            const [, setGhostTilePositions] = this.data.ghostTilePositions;
            const toRemove = new Set<string>(newCells.map(cell => JSON.stringify(cell)));
            setGhostTilePositions( positions => positions.filter( cell =>  !toRemove.has(JSON.stringify(cell)) ) )
        }

        this.start = undefined;
        this.end = undefined
    }

}
