import { Cardinal } from "../enums/Cardinal";
import { Tile } from "../interfaces/Tile";
import { GameMap } from "./GameMap";
import { RaycastHit } from "./RaycastHit";
import { Vector2 } from "./Vector2";

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

    cast(distance: number, map: GameMap): void {
        let firstRowHit: RaycastHit | null = null;
        let firstColHit: RaycastHit | null = null;

        if (this.direction.row !== 0) {
            let currentRowPosition: Vector2 = this.origin.clone();
            const rowStepDirection: number = this.direction.row < 0 ? -1 : 1;
            while (firstRowHit == null && Vector2.distance(currentRowPosition, this.origin) < distance && map.inBounds(currentRowPosition.row, currentRowPosition.col)) {
                const nextRow: number = rowStepDirection > 0 ? Math.floor(currentRowPosition.row + rowStepDirection) : Math.ceil(currentRowPosition.row + rowStepDirection);
                currentRowPosition = currentRowPosition.add( this.direction.alterToRow(nextRow - currentRowPosition.row) );
                const tileToCheck: Vector2 = rowStepDirection > 0 ? currentRowPosition.int() : new Vector2( Math.floor( currentRowPosition.row + rowStepDirection ), Math.floor(currentRowPosition.col));
                if (map.inBounds(tileToCheck.row, tileToCheck.col)) {
                    const tile: Tile = map.at(tileToCheck.row, tileToCheck.col);
                    if (tile.canHit()) {
                        firstRowHit = new RaycastHit(currentRowPosition, this.direction.row <= 0 ? Cardinal.NORTH : Cardinal.SOUTH, tile);
                        break;
                    }
                }
            }
        }

        if (this.direction.col !== 0) {
            let currentColPosition: Vector2 = this.origin.clone();
            const colStepDirection = this.direction.col <= 0 ? -1 : 1;
            while (firstColHit == null && Vector2.distance(currentColPosition, this.origin) < distance && map.inBounds(currentColPosition.row, currentColPosition.col)) {
                const nextCol: number = colStepDirection > 0 ? Math.floor(currentColPosition.col + colStepDirection) : Math.ceil(currentColPosition.col + colStepDirection);
                currentColPosition = currentColPosition.add( this.direction.alterToCol(nextCol - currentColPosition.col) );
    
                const tileToCheck: Vector2 = colStepDirection > 0 ? currentColPosition.int() : new Vector2(Math.floor(currentColPosition.row), Math.floor( currentColPosition.col + colStepDirection  ));
                if (map.inBounds(tileToCheck.row, tileToCheck.col)) {
                    const tile: Tile = map.at(tileToCheck.row, tileToCheck.col);
                    if (tile.canHit()) {
                        firstColHit = new RaycastHit(currentColPosition, this.direction.col <= 0 ? Cardinal.WEST : Cardinal.EAST, tile);
                    }
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


// public class Ray {

//     public void Cast(int distance, Map map) {
//         RayCastHit? firstRowHit = null;
//         RayCastHit? firstColHit = null;

//         Vector2Double currentRowPosition = this.origin;
//         int rowStepDirection = direction.row < 0 ? -1 : 1;
//         while (firstRowHit == null && Vector2Double.Distance(currentRowPosition, this.origin) < distance  && map.InBounds(currentRowPosition) ) {
//             double nextRow = rowStepDirection > 0 ? Math.Floor(currentRowPosition.row + rowStepDirection) : Math.Ceiling(currentRowPosition.row + rowStepDirection);
//             currentRowPosition += direction.AlterToRow(nextRow - currentRowPosition.row); 
//             Vector2Int tileToCheck = rowStepDirection > 0 ? currentRowPosition.Int() : new Vector2Int((int)Math.Round(currentRowPosition.row + rowStepDirection), (int)currentRowPosition.col);
//             if (map.InBounds(tileToCheck)) {
//                 Tile tile = map.At(tileToCheck);
//                 if (tile is IHittable) {
//                     firstRowHit = new RayCastHit(currentRowPosition, direction.row <= 0 ? Cardinal.NORTH : Cardinal.SOUTH, tile as IHittable);
//                     break;
//                 }
//             }
//         }

//         Vector2Double currentColPosition = this.origin;
//         int colStepDirection = direction.col < 0 ? -1 : 1;
//         while (firstColHit == null && Vector2Double.Distance(currentColPosition, this.origin) < distance && map.InBounds(currentColPosition) ) {
//             double nextCol = colStepDirection > 0 ? Math.Floor(currentColPosition.col + colStepDirection) : Math.Ceiling(currentColPosition.col + colStepDirection);
//             currentColPosition += direction.AlterToCol(nextCol - currentColPosition.col);

//             Vector2Int tileToCheck = colStepDirection > 0 ? currentColPosition.Int() : new Vector2Int((int)currentColPosition.row, (int)Math.Round(currentColPosition.col + colStepDirection));
//             if (map.InBounds(tileToCheck) ) {
//                 Tile tile = map.At(tileToCheck);
//                 if (tile is IHittable) {
//                     firstColHit = new RayCastHit(currentColPosition, direction.col <= 0 ? Cardinal.WEST : Cardinal.EAST, tile as IHittable);
//                     break;
//                 }
//             }
//         }


//         if (!firstRowHit.HasValue && !firstColHit.HasValue) {
//             OnNoHit?.Invoke();
//         } else if (!firstRowHit.HasValue && firstColHit.HasValue) {
//             OnHit(firstColHit.Value);
//         } else if (firstRowHit.HasValue && !firstColHit.HasValue) {
//             OnHit(firstRowHit.Value);
//         } else if (firstRowHit.HasValue && firstColHit.HasValue) {
//             if (Vector2Double.Distance(firstRowHit.Value.Position, this.origin) <= Vector2Double.Distance(firstColHit.Value.Position, this.origin)) {
//                 OnHit(firstRowHit.Value);
//             } else {
//                 OnHit(firstColHit.Value);
//             }
//         }


//     }
// }