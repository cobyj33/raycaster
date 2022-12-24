import {
    Vector2, LineSegment, addVector2, subtractVector2, scaleVector2, rotateVector2, vector2ToLength, vector2Normalized, distanceBetweenVector2, angleBetweenVector2, translateVector2,
    GameMap,
    Ray, RaycastHit, RaycastNoHit, castRay, 
    Color, darkenColor, colorToRGBString, colorToRGBAString, areEqualColors, gameMapInBounds, vector2Int,
    StatefulData,
    areGameMapsEqual,
    vector2Equals
} from "raycaster/interfaces";


interface CameraData {
    readonly map: GameMap;
    readonly position: Vector2;
    readonly direction: Vector2;
    readonly fieldOfView: number;
    readonly viewDistance: number;
    readonly lookingAngle: number;
}

interface CameraCache {
    lastState: CameraData;
    lines: CameraLine[];
    rayHits: Array<RaycastHit | RaycastNoHit>;
}

export function areEqualCameraDatas(first: CameraData, second: CameraData): boolean {
    return vector2Equals(first.position, second.position) && vector2Equals(first.direction, second.direction) && first.fieldOfView === second.fieldOfView && first.viewDistance === second.viewDistance && first.lookingAngle === second.lookingAngle && areGameMapsEqual(first.map, second.map);
}

export function isCameraCacheUpdated(camera: Camera): boolean {
    return areEqualCameraDatas(camera, camera.cache.lastState);
}

export function clearCameraCache(camera: Camera): void {
    camera.cache.lastState = camera;
    camera.cache.rayHits = [];
    camera.cache.lines = [];
}

export interface Camera extends CameraData {
    readonly cache: CameraCache;
    readonly moveAmount: number;
    readonly sensitivity: number;
}

export interface CameraLine {
    readonly hit?: RaycastHit;
    readonly lineLengthPercentage: number;
}

export const emptyCameraLine: CameraLine = {
    hit: undefined,
    lineLengthPercentage: 0
}

export const getDefaultCamera = (() => {
    const standardCameraFOV: number = 7 * Math.PI / 18;
    const standardCameraPosition = { row: 0, col: 0 };
    const standardCameraDirection = { row: 0, col: 1 };
    const standardMoveAmount: number = 0.25;
    const standardLookingAngle: number = 0;
    const standardViewDistance: number = 1000;
    const standardSensitivity: number = 1;

    return (map: GameMap): Camera => {
        const cameraData: CameraData = {
            map: map,
            position: standardCameraPosition,
            direction: standardCameraDirection,
            fieldOfView: standardCameraFOV,
            viewDistance: standardViewDistance,
            lookingAngle: standardLookingAngle,
        }       

        const cameraCache: CameraCache = {
            lastState: {...cameraData},
            lines: [],
            rayHits: []
        }

        return {
            ...cameraData,
            cache: cameraCache,
            moveAmount: standardMoveAmount,
            sensitivity: standardSensitivity,
        }
    }
})();

export function getCameraPlane(camera: Camera): LineSegment {
    const startingCameraPlaneLocation: Vector2 = addVector2(camera.position, vector2Normalized(rotateVector2(camera.direction, camera.fieldOfView / 2.0)) );
    const endingCameraPlaneLocation: Vector2 = addVector2(camera.position, vector2Normalized(rotateVector2(camera.direction, camera.fieldOfView / -2.0)) );

    return {
        start: startingCameraPlaneLocation,
        end: endingCameraPlaneLocation
    }
}

export function getCameraRays(camera: Camera, lineCount: number): Ray[] {
    const rays: Ray[] = [];
    const {start: startingCameraPlaneLocation, end: endingCameraPlaneLocation} = getCameraPlane(camera);
    const perpendicularDirection: Vector2 = subtractVector2(endingCameraPlaneLocation, startingCameraPlaneLocation);
    const distanceBetweenStartAndEnd: number = distanceBetweenVector2(startingCameraPlaneLocation, endingCameraPlaneLocation);
    let currentCameraPlaneLocation: Vector2 = { ...startingCameraPlaneLocation };

    for (let i = 0; i < lineCount; i++) {
        currentCameraPlaneLocation = addVector2(currentCameraPlaneLocation, vector2ToLength(perpendicularDirection, distanceBetweenStartAndEnd / lineCount));
        const rayDirection: Vector2 = subtractVector2(currentCameraPlaneLocation, camera.position);
        rays.push( {
            origin: camera.position,
            direction: rayDirection
        });
        // new Ray(camera.position, rayDirection, () => { onHit?.() }, () => { onNoHit?.() }));
    }

   return rays;
}


export function getCameraLines(camera: Camera, lineCount: number): CameraLine[] {
    const cameraLineData: CameraLine[] = [];
    const {start: cameraPlaneStart, end: cameraPlaneEnd} = getCameraPlane(camera);
    const perpendicularDirection = subtractVector2(cameraPlaneEnd, cameraPlaneStart);
    const shouldUpdateCameraCache = !isCameraCacheUpdated(camera);

    if (shouldUpdateCameraCache) {
        clearCameraCache(camera);
    }

    const rays: Ray[] = getCameraRays(camera, lineCount);
    rays.forEach(ray => {
        const result: RaycastHit | RaycastNoHit = castRay(ray, camera.map, camera.viewDistance)
        if ("hitObject" in result) {
            const hit = result as RaycastHit
            const rayPlaneIntersection: Vector2 = addVector2(hit.originalRay.origin, hit.originalRay.direction);
            const distanceFromHitToPlane: number = distanceBetweenVector2(rayPlaneIntersection, hit.end) * Math.sin( Math.min(angleBetweenVector2( perpendicularDirection, hit.originalRay.direction ), angleBetweenVector2( scaleVector2(perpendicularDirection, -1), hit.originalRay.direction ) ) );

            const cameraLine: CameraLine = {
                lineLengthPercentage: 1.0 / distanceFromHitToPlane,
                hit: hit
            }

            cameraLineData.push( cameraLine );

            if (shouldUpdateCameraCache) {
                camera.cache.rayHits.push(hit);
                camera.cache.lines.push( cameraLine )
            }
        } else {
            const noHit = result as RaycastNoHit
            cameraLineData.push(emptyCameraLine)
            if (shouldUpdateCameraCache) {
                camera.cache.rayHits.push(noHit);
                camera.cache.lines.push(emptyCameraLine);
            }
        }
    });

    return cameraLineData;
}

export function tryPlaceCamera(camera: Camera, targetCell: Vector2): Vector2 {

    if (gameMapInBounds(camera.map, targetCell.row, targetCell.col)) {
        targetCell = vector2Int(targetCell);
        if (camera.map.tiles[targetCell.row][targetCell.col].canCollide) {
            let found = false;
            const searchQueue: Vector2[] = [];
            const visited: Set<string> = new Set<string>();
            searchQueue.push(targetCell);
            visited.add(JSON.stringify(targetCell));
            let current: Vector2 = targetCell;
            while (searchQueue.length > 0 && !found && visited.size < camera.map.dimensions.row * camera.map.dimensions.col) {
                current = searchQueue.splice(0, 1)[0];
                if (current.row >= 0 && current.col >= 0 && current.row < camera.map.tiles.length && current.col < camera.map.tiles[0].length) {
                    if (camera.map.tiles[current.row][current.col].canCollide === false) {
                        found = true;
                        break;
                    }
                }

                const neighbors: Vector2[] = [translateVector2(current, 1, 0), translateVector2(current, 0, 1), translateVector2(current, -1, 0), translateVector2(current, 0, -1)].filter(cell => !visited.has(JSON.stringify(cell)));

                neighbors.forEach(cell => {
                    visited.add(JSON.stringify(cell));
                    searchQueue.push(cell);
                });
            }

            // setCamera(camera => camera.setPosition(current));
            return current;
        } else {
            return {...targetCell};
        }
    } else {
        return { row: camera.map.dimensions.row / 2, col: camera.map.dimensions.col / 2 }
    }
}

export const renderCamera: (camera: Camera, finalCanvas: HTMLCanvasElement) => void = ( () => {
    const canvas = document.createElement("canvas");
    const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

    return (camera: Camera, finalCanvas: HTMLCanvasElement) => {
        canvas.width = finalCanvas.width;
        canvas.height = finalCanvas.height;
        const cameraLineData: CameraLine[] = getCameraLines(camera, canvas.width);

        if (context === null) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';
        context.lineWidth = 1;
        const centerHeight: number = Math.trunc(canvas.height / 2 + (Math.tan(camera.lookingAngle) * canvas.height / 2));
        context.fillStyle = colorToRGBString(camera.map.skyBox.floorColor);
        context.fillRect(0, centerHeight, canvas.width, canvas.height - centerHeight);
        context.fillStyle = colorToRGBString(camera.map.skyBox.skyColor);
        context.fillRect(0, 0, canvas.width, centerHeight);
        context.globalAlpha = 1;
        context.lineWidth = 2;
        context.lineCap = 'square';

        context.beginPath();
        let lastColor: Color | null = null;

        for (let col = 0; col < cameraLineData.length; col++) {
            const currentLine: CameraLine = cameraLineData[col];
            if (currentLine.hit != null) {
                let color: Color = currentLine.hit.hitObject.color;
                switch(currentLine.hit.side) {
                    case "west": { color = darkenColor(color, 50); break; }
                    case "east": { color = darkenColor(color, 50); break; }
                    case "south": { color = darkenColor(color, 100); break; }
                }

                if (lastColor !== null) {
                    context.strokeStyle = colorToRGBAString(lastColor);
                    if (!areEqualColors(color, lastColor)) {
                        const lastAlpha: number = context.globalAlpha;
                        context.globalAlpha = lastColor.alpha / 255;
                        context.stroke();
                        context.globalAlpha = lastAlpha;
                        context.beginPath();
                    }
                }
                lastColor = {...color};
            } else {
                context.strokeStyle = 'white';
            }
            const lineHeightInPixels: number = Math.trunc(currentLine.lineLengthPercentage * canvas.height);
            context.moveTo(col, Math.trunc(centerHeight - ( lineHeightInPixels / 2)) );
            context.lineTo(col, Math.trunc(centerHeight + ( lineHeightInPixels / 2)) );
        }
        context.stroke();
        
        const finalCanvasContext: CanvasRenderingContext2D | null = finalCanvas.getContext("2d");
        if (finalCanvasContext !== null && finalCanvasContext !== undefined) {
            finalCanvasContext.drawImage(canvas, 0, 0);
        }
    }
})();

export function cameraToString(camera: Camera): string {
    return ` [Camera: {
        Position: ${camera.position},
        Direction: ${camera.direction},
        FOV: ${camera.fieldOfView},
        viewDistance: ${camera.viewDistance}
    }]`
}
