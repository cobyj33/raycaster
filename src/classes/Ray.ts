import { Cardinal } from "../enums/Cardinal";
import { Tile } from "../interfaces/Tile";
import { GameMap } from "./GameMap";
import { RaycastHit } from "./Data/RaycastHit";
import { Vector2 } from "./Data/Vector2";

export class Ray {
    public readonly origin: Vector2;
    public readonly direction: Vector2;
    private _end?: Vector2;
    public readonly onHit: (hit: RaycastHit) => void;
    public readonly onNoHit: () => void;

    get end() { return this._end; }

    constructor(origin: Vector2, direction: Vector2, onHit: (hit: RaycastHit) => void, onNoHit: () => void = () => { }) {
        this.origin = origin.clone();
        this.direction = direction.clone();
        this.onHit = onHit;
        this.onNoHit = onNoHit;
    }

    // castOptimized(distance: number, map: GameMap) {
    //     let hit: RaycastHit | null = null;
    //     let traveledDistance = 0;
    //     let currentPosition = this.origin.clone();

    //     const rowStepDirection = this.direction.row < 0 ? -1 : 1;
    //     const colStepDirection = this.direction.col < 0 ? -1 : 1;

    //     while (hit == null && traveledDistance < 0 && map.inBounds(currentPosition.row, currentPosition.col)) {

    //     }

    //     if (hit !== null && hit !== undefined) {
    //         this.onHit(hit);
    //     } else {
    //         this.onNoHit?.();
    //     }
    // }

    testHit(tileToCheck: Vector2, map: GameMap): boolean {
        if (map.inBounds(tileToCheck.row, tileToCheck.col)) {
            const tile: Tile = map.at(tileToCheck.row, tileToCheck.col);
            if (tile.canHit()) {
                return true;
            }
        }
        return false;
    }

    cast(distance: number, map: GameMap): void {
        let firstRowHit: RaycastHit | null = null;
        let firstColHit: RaycastHit | null = null;

        let currentRowPosition: Vector2 = this.origin.clone();
        if (this.direction.row !== 0) {
            const rowStepDirection: number = this.direction.row < 0 ? -1 : 1;

            while (firstRowHit == null && Vector2.distance(currentRowPosition, this.origin) < distance && map.inBounds(currentRowPosition.row, currentRowPosition.col)) {
                const nextRow: number = rowStepDirection > 0 ? Math.floor(currentRowPosition.row + rowStepDirection) : Math.ceil(currentRowPosition.row + rowStepDirection);
                currentRowPosition = currentRowPosition.add( this.direction.alterToRow(nextRow - currentRowPosition.row) );
                if (!Number.isInteger(currentRowPosition.row)) {
                    currentRowPosition = new Vector2(Math.round(currentRowPosition.row), currentRowPosition.col);
                }
                const tileToCheck: Vector2 = rowStepDirection > 0 ? currentRowPosition.int() : new Vector2( Math.floor( currentRowPosition.row + rowStepDirection), Math.floor(currentRowPosition.col));
                if (this.testHit(tileToCheck, map)) {
                    // console.log('accepted: ', tileToCheck);
                    const tile = map.at(tileToCheck.row, tileToCheck.col);
                    firstRowHit = new RaycastHit(currentRowPosition, this.direction.row <= 0 ? Cardinal.NORTH : Cardinal.SOUTH, tile);
                }
            }

            // if (firstRowHit == null) {
            //     console.log('unaccepted: ', currentRowPosition);
            // }
        }

        const rowDistance = Vector2.distance(currentRowPosition, this.origin);
        if (this.direction.col !== 0) {
            let currentColPosition: Vector2 = this.origin.clone();
            let distanceTraveled = 0;
            const colStepDirection = this.direction.col <= 0 ? -1 : 1;
            while (firstColHit == null && Vector2.distance(currentColPosition, this.origin) < distance && map.inBounds(currentColPosition.row, currentColPosition.col)) {
                const nextCol: number = colStepDirection > 0 ? Math.floor(currentColPosition.col + colStepDirection) : Math.ceil(currentColPosition.col + colStepDirection);
                distanceTraveled += nextCol - currentColPosition.col;
                if (distanceTraveled > rowDistance && (firstRowHit !== null && firstRowHit !== undefined)) { break; }
                currentColPosition = currentColPosition.add( this.direction.alterToCol(nextCol - currentColPosition.col) );
                if (!Number.isInteger(currentColPosition.col)) {
                    currentColPosition = new Vector2(currentColPosition.row, Math.round(currentColPosition.col));
                }



                const tileToCheck: Vector2 = colStepDirection > 0 ? currentColPosition.int() : new Vector2(Math.floor(currentColPosition.row), Math.floor( currentColPosition.col + colStepDirection  ));
                if (this.testHit(tileToCheck, map)) {
                    const tile = map.at(tileToCheck.row, tileToCheck.col);
                    firstColHit = new RaycastHit(currentColPosition, this.direction.col <= 0 ? Cardinal.WEST : Cardinal.EAST, tile);
                }
            }
        }

        if (firstRowHit == null && firstColHit == null) {
            // console.log("NO HIT");
            this.onNoHit();
            this._end = this.origin.add(this.direction.toLength(distance));
        } else if (firstRowHit != null && firstColHit == null) {
            // console.log("ROW HIT");
            this.onHit(firstRowHit);
            this._end = firstRowHit.position;
        } else if (firstRowHit == null && firstColHit != null) {
            // console.log("COL HIT");
            this.onHit(firstColHit);
            this._end = firstColHit.position;
        } else if (firstRowHit != null && firstColHit != null) {
            // console.log("BOTH HIT");
            if (Vector2.distance( this.origin, firstRowHit.position ) <= Vector2.distance( this.origin, firstColHit.position ) ) {
                this.onHit(firstRowHit);
                this._end = firstRowHit.position;
            } else {
                this.onHit(firstColHit);
                this._end = firstColHit.position;
            }
        }
        // console.log('bottom');
    }

}