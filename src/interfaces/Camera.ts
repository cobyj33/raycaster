import { StatefulData } from "interfaces/utilityInterfaces"

import { GameMap, areGameMapsEqual, gameMapInBounds } from "interfaces/GameMap"
import { Ray, RaycastHit, RaycastNoHit, castRay } from "interfaces/Ray"
import { Color, darkenColor, colorToRGBString, colorToRGBAString, areEqualColors } from "interfaces/Color"
import { IVector2, vector2Int, LineSegment, addVector2, subtractVector2, scaleVector2, rotateVector2, vector2ToLength, vector2Normalized, distanceBetweenVector2, angleBetweenVector2, translateVector2, vector2Equals } from "interfaces/Vector2"
import React from "react"

import WebGLUtils from "functions/webgl"
import cameraVertexShaderSource from "shaders/camera.vert?raw"
import cameraFragmentShaderSource from "shaders/camera.frag?raw"

interface CameraData {
    readonly map: GameMap;
    readonly position: IVector2;
    readonly direction: IVector2;
    readonly fieldOfView: number;
    readonly viewDistance: number;
    readonly lookingAngle: number;
}


export function areEqualCameraDatas(first: CameraData, second: CameraData): boolean {
    return vector2Equals(first.position, second.position) && vector2Equals(first.direction, second.direction) && first.fieldOfView === second.fieldOfView && first.viewDistance === second.viewDistance && first.lookingAngle === second.lookingAngle && areGameMapsEqual(first.map, second.map);
}

export interface Camera extends CameraData {
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

        return {
            ...cameraData,
            moveAmount: standardMoveAmount,
            sensitivity: standardSensitivity,
        }
    }
})();

export function getCameraPlane(camera: Camera): LineSegment {
    const startingCameraPlaneLocation: IVector2 = addVector2(camera.position, vector2Normalized(rotateVector2(camera.direction, camera.fieldOfView / 2.0)) );
    const endingCameraPlaneLocation: IVector2 = addVector2(camera.position, vector2Normalized(rotateVector2(camera.direction, camera.fieldOfView / -2.0)) );

    return {
        start: startingCameraPlaneLocation,
        end: endingCameraPlaneLocation
    }
}

export function getCameraRays(camera: Camera, lineCount: number): Ray[] {
    const rays: Ray[] = [];
    const {start: startingCameraPlaneLocation, end: endingCameraPlaneLocation} = getCameraPlane(camera);
    const perpendicularDirection: IVector2 = subtractVector2(endingCameraPlaneLocation, startingCameraPlaneLocation);
    const distanceBetweenStartAndEnd: number = distanceBetweenVector2(startingCameraPlaneLocation, endingCameraPlaneLocation);
    let currentCameraPlaneLocation: IVector2 = { ...startingCameraPlaneLocation };

    for (let i = 0; i < lineCount; i++) {
        currentCameraPlaneLocation = addVector2(currentCameraPlaneLocation, vector2ToLength(perpendicularDirection, distanceBetweenStartAndEnd / lineCount));
        const rayDirection: IVector2 = subtractVector2(currentCameraPlaneLocation, camera.position);
        rays.push( {
            origin: camera.position,
            direction: rayDirection
        });
    }

   return rays;
}


export function getCameraLines(camera: Camera, lineCount: number): CameraLine[] {
    const cameraLineData: CameraLine[] = [];
    const {start: cameraPlaneStart, end: cameraPlaneEnd} = getCameraPlane(camera);
    const perpendicularDirection = subtractVector2(cameraPlaneEnd, cameraPlaneStart);


    const rays: Ray[] = getCameraRays(camera, lineCount);
    rays.forEach(ray => {
        const result: RaycastHit | RaycastNoHit = castRay(ray, camera.map, camera.viewDistance)
        if ("hitObject" in result) {
            const hit = result as RaycastHit
            const rayPlaneIntersection: IVector2 = addVector2(hit.originalRay.origin, hit.originalRay.direction);
            const distanceFromHitToPlane: number = distanceBetweenVector2(rayPlaneIntersection, hit.end) * Math.sin( Math.min(angleBetweenVector2( perpendicularDirection, hit.originalRay.direction ), angleBetweenVector2( scaleVector2(perpendicularDirection, -1), hit.originalRay.direction ) ) );

            const cameraLine: CameraLine = {
                lineLengthPercentage: 1.0 / distanceFromHitToPlane,
                hit: hit
            }

            cameraLineData.push( cameraLine );

        } else {
            const noHit = result as RaycastNoHit
            cameraLineData.push(emptyCameraLine)
        }
    });

    return cameraLineData;
}

export function tryPlaceCamera(camera: Camera, targetCell: IVector2): IVector2 {

    if (gameMapInBounds(camera.map, targetCell.row, targetCell.col)) {
        targetCell = vector2Int(targetCell);
        if (camera.map.tiles[targetCell.row][targetCell.col].canCollide) {
            let found = false;
            const searchQueue: IVector2[] = [];
            const visited: Set<string> = new Set<string>();
            searchQueue.push(targetCell);
            visited.add(JSON.stringify(targetCell));
            let current: IVector2 = targetCell;
            while (searchQueue.length > 0 && !found && visited.size < camera.map.dimensions.row * camera.map.dimensions.col) {
                current = searchQueue.splice(0, 1)[0];
                if (current.row >= 0 && current.col >= 0 && current.row < camera.map.tiles.length && current.col < camera.map.tiles[0].length) {
                    if (camera.map.tiles[current.row][current.col].canCollide === false) {
                        found = true;
                        break;
                    }
                }

                const neighbors: IVector2[] = [translateVector2(current, 1, 0), translateVector2(current, 0, 1), translateVector2(current, -1, 0), translateVector2(current, 0, -1)].filter(cell => !visited.has(JSON.stringify(cell)));

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

export function getCameraProgram(gl: WebGL2RenderingContext): WebGLProgram {
    const quadVertices: number[] = [
        -1, -1,
        1, -1,
        1, 1,
        -1, 1
    ]

    const quadIndices: number[] = [
        0, 1, 3, 1, 3, 2
    ]

    const vertexBuffer = WebGLUtils.createVertexBuffer(gl, quadVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const quadVertexBuffer = WebGLUtils.createElementArrayBuffer(gl, quadIndices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadVertexBuffer);
    const cameraRenderProgram = WebGLUtils.compileProgramFromSourceStrings(gl, cameraVertexShaderSource, cameraFragmentShaderSource)
    gl.useProgram(cameraRenderProgram)
    const aPosLocation = gl.getAttribLocation(cameraRenderProgram, "aPos");
    gl.enableVertexAttribArray(aPosLocation);
    gl.vertexAttribPointer(aPosLocation, 2, gl.FLOAT, false, 0, 0);
    return cameraRenderProgram;
}


/**
 * Cast camera lines and render the output of the camera onto the canavas
 * @param camera the Camera object to render from
 * @param canvas The canvas to render to 
 * @param gl The gl context to render to, must be the same gl context as the canvas given
 * @param cameraRenderProgram The camera render program to use (outputted by this program, put the same one here in consecutive calls so that new programs do not have to be compiled)
 * @returns The same cameraRenderProgram if given, a new cameraRenderProgram if passed null
 */
export function renderCamera(camera: Camera, canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, cameraRenderProgram: WebGLProgram | null): WebGLProgram {
    canvas.width = canvas.width;
    canvas.height = canvas.height;

    if (cameraRenderProgram === null || cameraRenderProgram === undefined) {
        cameraRenderProgram = getCameraProgram(gl)
    }

    const cameraLineData: CameraLine[] = getCameraLines(camera, canvas.width);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const TRANSPARENT = { red: 0, green: 0, blue: 0, alpha: 0}

    const textureData = new Float32Array(cameraLineData.length * 4 * 2)

    // fill first line, percentage and color data
    for (let i = 0; i < cameraLineData.length; i++) {
        const data = cameraLineData[i]
        let color = TRANSPARENT
        let darkenPercentage = 0.0;
        
        if (data.hit !== null && data.hit !== undefined) {
            color = data.hit.hitObject.color
            switch(data.hit.side) {
                case "west": darkenPercentage = 0.10; break;
                case "east": darkenPercentage = 0.10; break;
                case "south": darkenPercentage = 0.20; break;
            }
        }
        
        textureData[i * 4] = data.lineLengthPercentage;
        textureData[i * 4 + 1] = color.red / 255;
        textureData[i * 4 + 2] = color.green / 255;
        textureData[i * 4 + 3] = color.blue / 255;

        textureData[cameraLineData.length * 4 + i * 4] = darkenPercentage;
        textureData[cameraLineData.length * 4 + i * 4 + 1] = 0; // empty values for now
        textureData[cameraLineData.length * 4 + i * 4 + 2] = 0; // empty values for now
        textureData[cameraLineData.length * 4 + i * 4 + 3] = 1; // empty values for now
    }

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, cameraLineData.length, 2, 0, gl.RGBA, gl.FLOAT, textureData)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const texPosition = gl.getUniformLocation(cameraRenderProgram, "cameraLines");
    const resolutionPosition = gl.getUniformLocation(cameraRenderProgram, "resolution")
    const numOfCameraLinesPosition = gl.getUniformLocation(cameraRenderProgram, "numOfCameraLines")
    const centerLineHeightPosition = gl.getUniformLocation(cameraRenderProgram, "centerLineHeight")
    gl.uniform1i(texPosition, 0)
    gl.uniform2f(resolutionPosition, canvas.width, canvas.height)
    gl.uniform1i(numOfCameraLinesPosition, cameraLineData.length)
    const centerHeight: number = 0.5 - (Math.tan(camera.lookingAngle) * 0.5);

    gl.uniform1f(centerLineHeightPosition, centerHeight)

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    return cameraRenderProgram
};


export function cameraToString(camera: Camera): string {
    return ` [Camera: {
        Position: ${camera.position},
        Direction: ${camera.direction},
        FOV: ${camera.fieldOfView},
        viewDistance: ${camera.viewDistance}
    }]`
}
