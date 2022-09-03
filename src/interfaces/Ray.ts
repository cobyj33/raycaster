import {
    Vector2, addVector2, vector2ToLength, distanceBetweenVector2, vector2AlterToRow, vector2AlterToCol,
    RaycastHit, RaycastNoHit,
    GameMap,
} from "raycaster/interfaces";

export interface Ray {
    readonly origin: Vector2;
    readonly direction: Vector2;
    readonly onHit?: (hit: RaycastHit) => void;
    readonly onNoHit?: (noHit: RaycastNoHit) => void;
}

export function inDimensionBounds({row, col}: Vector2, {row: rows, col: cols}: Vector2) {
    return row >= 0 && col >= 0 && row < rows && col < cols;
}

export function castRay(ray: Ray, map: GameMap, distance: number): void {
        
        if ( (ray.onHit === null || ray.onHit === undefined) && (ray.onNoHit === null || ray.onNoHit === undefined) ) {
            return;
        }

        let firstRowHit: RaycastHit | null = null;
        let firstColHit: RaycastHit | null = null;


        let currentRowPosition: Vector2 = {...ray.origin};
    if (ray.direction.row !== 0) {
        const rowStepDirection: number = ray.direction.row < 0 ? -1 : 1;

        while (firstRowHit === null && distanceBetweenVector2(currentRowPosition, ray.origin) < distance && inDimensionBounds(currentRowPosition, map.dimensions)) {

            const nextRow: number = rowStepDirection > 0 ? Math.floor(currentRowPosition.row + rowStepDirection) : Math.ceil(currentRowPosition.row + rowStepDirection);
            currentRowPosition = addVector2(currentRowPosition, vector2AlterToRow(ray.direction, nextRow - currentRowPosition.row));
                if (!Number.isInteger(currentRowPosition.row)) {
                    currentRowPosition = {...currentRowPosition, row: Math.round(currentRowPosition.row)};
                }

            const tileToCheck: Vector2 = rowStepDirection > 0 ? { row: Math.trunc(currentRowPosition.row), col: Math.trunc(currentRowPosition.col) } : {row: Math.floor( currentRowPosition.row + rowStepDirection), col: Math.floor(currentRowPosition.col) };

            if (inDimensionBounds(tileToCheck, map.dimensions)) {
                if (map.tiles[tileToCheck.row][tileToCheck.col].canHit) {
                    firstRowHit = {
                        position: currentRowPosition,
                        side: ray.direction.row <= 0 ? "north" : "south",
                        hitObject: map.tiles[tileToCheck.row][tileToCheck.col],
                        originalRay: ray
                    }
                    // new RaycastHit(currentRowPosition, this.direction.row <= 0 ? "north" : "south", tile);
                }
            }


        }
    }

    const rowDistance = distanceBetweenVector2(currentRowPosition, ray.origin);
    
    if (ray.direction.col !== 0) {
        let currentColPosition: Vector2 = {...ray.origin};
        let distanceTraveled = 0;
        const colStepDirection = ray.direction.col <= 0 ? -1 : 1;

        while (firstColHit === null && distanceBetweenVector2(currentColPosition, ray.origin) < distance && inDimensionBounds(currentColPosition, map.dimensions)) {
            const nextCol: number = colStepDirection > 0 ? Math.floor(currentColPosition.col + colStepDirection) : Math.ceil(currentColPosition.col + colStepDirection);

            distanceTraveled += nextCol - currentColPosition.col;
            if (distanceTraveled > rowDistance && (firstRowHit !== null && firstRowHit !== undefined)) {
                break;
            }

            currentColPosition = addVector2(currentColPosition, vector2AlterToCol(ray.direction, nextCol - currentColPosition.col));

            if (!Number.isInteger(currentColPosition.col)) {
                currentColPosition = { ...currentColPosition, col: Math.round(currentColPosition.col) };
            }

            const tileToCheck: Vector2 = colStepDirection > 0 ? { row: Math.trunc(currentColPosition.row), col: Math.trunc(currentColPosition.col) } : { row: Math.floor(currentColPosition.row), col: Math.floor( currentColPosition.col + colStepDirection  ) };
            
            if (inDimensionBounds(tileToCheck, map.dimensions)) {
                if (map.tiles[tileToCheck.row][tileToCheck.col].canHit) {
                    firstColHit = {
                        position: currentColPosition,
                        hitObject: map.tiles[tileToCheck.row][tileToCheck.col],
                        side: ray.direction.col < 0 ? "east" : "west",
                        originalRay: ray
                    }
                }
            }

        }
    }

    if (firstRowHit === null && firstColHit === null) {
        if (ray.onNoHit !== null && ray.onNoHit !== undefined) {
            ray.onNoHit({
                originalRay: ray,
                end: addVector2(ray.origin, vector2ToLength(ray.direction, distance)),
                distance: distance
            });
        }
    } else if (firstRowHit !== null && firstColHit === null) {
        if (ray.onHit !== null && ray.onHit !== undefined) {
            ray.onHit(firstRowHit);
        }
    } else if (firstRowHit === null && firstColHit !== null) {
        if (ray.onHit !== null && ray.onHit !== undefined) {
            ray.onHit(firstColHit);
        }
    } else if (firstRowHit != null && firstColHit != null) {
        if (ray.onHit !== null && ray.onHit !== undefined) {
            if (distanceBetweenVector2( ray.origin, firstRowHit.position ) <= distanceBetweenVector2( ray.origin, firstColHit.position ) ) {
                ray.onHit(firstRowHit);
            } else {
                ray.onHit(firstColHit);
            }
        }
    }
}
