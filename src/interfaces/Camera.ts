import { GameMap } from "interfaces/GameMap"
import { Ray, RaycastHit, castRay } from "interfaces/Ray"
import { IVector2, Vector2, vector2Int, addVector2, scaleVector2, distanceBetweenVector2, angleBetweenVector2, translateVector2, vector2Equals } from "jsutil"
import { LineSegment } from "jsutil"

import { createVertexBuffer, createElementArrayBuffer, compileProgramFromSourceStrings } from "jsutil/browser"
import cameraVertexShaderSource from "shaders/camera.vert?raw"
import cameraFragmentShaderSource from "shaders/camera.frag?raw"
import Texture, { TextureAtlas } from "./Texture"

export interface ICamera {
    readonly position: IVector2;
    readonly direction: IVector2;
    readonly fieldOfView: number;
    readonly viewDistance: number;
    readonly lookingAngle: number;
}



const CAMERA_PLANE_CAST_LENGTH = 0.0001

export class Camera implements ICamera {
    readonly position: Vector2;
    readonly direction: Vector2;
    readonly fieldOfView: number;
    readonly viewDistance: number;
    readonly lookingAngle: number;

    constructor(position: IVector2, direction: IVector2, fieldOfView: number, viewDistance: number, lookingAngle: number) {
        this.position = Vector2.fromData(position)
        this.direction = Vector2.fromData(direction)
        this.fieldOfView = fieldOfView
        this.viewDistance = viewDistance
        this.lookingAngle = lookingAngle
    }

    plane(distanceAway: number = 1) {
        const startingCameraPlaneLocation: IVector2 = this.position.add(this.direction.rotate(this.fieldOfView / 2.0).toLength(distanceAway))
        const endingCameraPlaneLocation: IVector2 = this.position.add(this.direction.rotate(this.fieldOfView / -2.0).toLength(distanceAway)) 
        return new LineSegment(startingCameraPlaneLocation, endingCameraPlaneLocation)
    }

    rays(count: number): Ray[] {
        const rays: Ray[] = [];
        const cameraPlane: LineSegment = this.plane(CAMERA_PLANE_CAST_LENGTH);
        const perpendicularDirection: Vector2 = cameraPlane.end.subtract(cameraPlane.start)
        const cameraPlaneLength: number = cameraPlane.length()
        let currentCameraPlaneLocation: Vector2 = cameraPlane.start;
        const step = perpendicularDirection.toLength(cameraPlaneLength / count)

        for (let i = 0; i < count; i++) {
            currentCameraPlaneLocation = currentCameraPlaneLocation.add(step);
            const rayDirection: IVector2 = currentCameraPlaneLocation.subtract(this.position).normalize()
            rays.push( {
                origin: this.position,
                direction: rayDirection
            });
        }

        return rays;
    }

    place(position: IVector2): Camera {
        return new Camera(position, this.direction, this.fieldOfView, this.viewDistance, this.lookingAngle)
    }

    face(direction: IVector2): Camera {
        return new Camera(this.position, direction, this.fieldOfView, this.viewDistance, this.lookingAngle)
    }

    withFOV(value: number): Camera {
        return new Camera(this.position, this.direction, value, this.viewDistance, this.lookingAngle)

    }

    withViewDistance(value: number): Camera {
        return new Camera(this.position, this.direction, this.fieldOfView, value, this.lookingAngle)

    }

    withLookingAngle(value: number): Camera {
        return new Camera(this.position, this.direction, this.fieldOfView, this.viewDistance, value)
    }

    cameraLines(count: number, map: GameMap) {
        const cameraLineData: CameraLine[] = [];
        const cameraPlane = this.plane(CAMERA_PLANE_CAST_LENGTH);
        const perpendicularDirection = cameraPlane.end.subtract(cameraPlane.start);


        const rays: Ray[] = this.rays(count);
        rays.map(ray => castRay(ray, map, this.viewDistance)).forEach(result => {
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
                cameraLineData.push(emptyCameraLine)
            }
            
        });

        return cameraLineData;
    }

    static fromCameraData(cameraData: ICamera): Camera {
        return new Camera(Vector2.fromData(cameraData.position),
                            Vector2.fromData(cameraData.direction),
                            cameraData.fieldOfView,
                            cameraData.viewDistance,
                            cameraData.lookingAngle)
    }

    static default() {
        return Camera.fromCameraData(getDefaultCamera())
    }

    data(): ICamera {
        return {
            position: this.position.data(),
            direction: this.direction.data(),
            fieldOfView: this.fieldOfView,
            lookingAngle: this.lookingAngle,
            viewDistance: this.viewDistance
        }
    }
    
}

export function areEqualCameras(first: ICamera, second: ICamera): boolean {
    return vector2Equals(first.position, second.position) && vector2Equals(first.direction, second.direction) && first.fieldOfView === second.fieldOfView && first.viewDistance === second.viewDistance && first.lookingAngle === second.lookingAngle
}

export interface CameraLine {
    readonly hit?: RaycastHit;
    readonly lineLengthPercentage: number;
}

export const emptyCameraLine: CameraLine = {
    hit: undefined,
    lineLengthPercentage: 0
}

export const getDefaultCamera: () => ICamera = (() => {
    const standardCameraFOV: number = 7 * Math.PI / 18;
    const standardCameraPosition: IVector2 = { row: 0, col: 0 };
    const standardCameraDirection: IVector2 = { row: 0, col: 1 };
    const standardMoveAmount: number = 0.25;
    const standardLookingAngle: number = 0;
    const standardViewDistance: number = 1000;

    return (): ICamera => {
        return {
            position: standardCameraPosition,
            direction: standardCameraDirection,
            fieldOfView: standardCameraFOV,
            viewDistance: standardViewDistance,
            lookingAngle: standardLookingAngle,
        }
    }
})();

export function tryPlaceCamera(camera: Camera, map: GameMap, targetCell: IVector2): Vector2 {

    if (map.inBoundsVec2(targetCell)) {

        targetCell = vector2Int(targetCell);
        
        if (map.tiles[targetCell.row][targetCell.col].canCollide) {
            let found = false;
            const searchQueue: IVector2[] = [];
            const visited: Set<string> = new Set<string>();
            searchQueue.push(targetCell);
            visited.add(JSON.stringify(targetCell));
            let current: IVector2 = targetCell;
            while (searchQueue.length > 0 && !found && visited.size < map.area) {
                current = searchQueue.splice(0, 1)[0];
                if (map.inBoundsVec2(current)) {
                    if (map.tiles[current.row][current.col].canCollide === false) {
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

            return Vector2.fromData(current);
        } else {
            return Vector2.fromData(targetCell);
        }
    } else {
        return map.center
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

    const vertexBuffer = createVertexBuffer(gl, quadVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const quadVertexBuffer = createElementArrayBuffer(gl, quadIndices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadVertexBuffer);
    const cameraRenderProgram = compileProgramFromSourceStrings(gl, cameraVertexShaderSource, cameraFragmentShaderSource)
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
export function renderCamera(camera: Camera, map: GameMap, canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, cameraRenderProgram: WebGLProgram | null): WebGLProgram {
    canvas.width = canvas.width;
    canvas.height = canvas.height;

    if (cameraRenderProgram === null || cameraRenderProgram === undefined) {
        cameraRenderProgram = getCameraProgram(gl)
    }

    const cameraLineData: CameraLine[] = camera.cameraLines(canvas.width, map);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const TRANSPARENT = { red: 0, green: 0, blue: 0, alpha: 0}

    const shaderInputData = new Float32Array(cameraLineData.length * 4 * 3)
    const atlas: TextureAtlas = map.textureAtlas

    for (let i = 0; i < cameraLineData.length; i++) {
        const data = cameraLineData[i]
        let color = TRANSPARENT
        let brightness = 1.0;
        let hasTexture = 0;
        let textureX = 0;

        let textureTexelAtlasX = 0;
        let textureTexelAtlasY = 0;
        let textureTexelAtlasWidth = 0;
        let textureTexelAtlasHeight = 0;

        if (data.hit !== null && data.hit !== undefined) {
            color = data.hit.hitObject.color
            const tileTextureData = data.hit.hitObject.texture;
            textureX = data.hit.textureX;
            switch(data.hit.side) {
                case "west": brightness = 0.90; break;
                case "east": brightness = 0.90; break;
                case "south": brightness = 0.80; break;
            }
            
            if (tileTextureData !== null && tileTextureData !== undefined) {
                // if ( (tileTextureData.name in foundTextures) === false ) {
                //     foundTextures[tileTextureData.name] = { texture: tileTextureData, indexes: [cameraLineData.length * 2 * 4 + i * 4] };
                // } else {
                //     foundTextures[tileTextureData.name].indexes.push(cameraLineData.length * 2 * 4 + i * 4)
                // }
                const locationBox = atlas.getTextureTexelLocation(tileTextureData.name)
                textureTexelAtlasX = locationBox.topleft.col
                textureTexelAtlasY = locationBox.topleft.row
                textureTexelAtlasWidth = locationBox.size.width
                textureTexelAtlasHeight = locationBox.size.height 
                hasTexture = 1;
            }
        }
        
        shaderInputData[i * 4] = data.lineLengthPercentage;
        shaderInputData[i * 4 + 1] = color.red / 255;
        shaderInputData[i * 4 + 2] = color.green / 255;
        shaderInputData[i * 4 + 3] = color.blue / 255;


        shaderInputData[cameraLineData.length * 4 + i * 4] = brightness;
        shaderInputData[cameraLineData.length * 4 + i * 4 + 1] = hasTexture; // Has Texture (0 or 1)
        shaderInputData[cameraLineData.length * 4 + i * 4 + 2] = textureX; // TextureX, percentage across texture in texel coordinates
        shaderInputData[cameraLineData.length * 4 + i * 4 + 3] = 1; // empty value for now

        shaderInputData[cameraLineData.length * 2 * 4 + i * 4] = textureTexelAtlasX; // will be Texture X
        shaderInputData[cameraLineData.length * 2 * 4 + i * 4 + 1] = textureTexelAtlasY; /// will be Texture Y
        shaderInputData[cameraLineData.length * 2 * 4 + i * 4 + 2] = textureTexelAtlasWidth;// will be Texture Width
        shaderInputData[cameraLineData.length * 2 * 4 + i * 4 + 3] = textureTexelAtlasHeight; // will be Texture Height
    }

    const atlasGLTexture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE1)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.bindTexture(gl.TEXTURE_2D, atlasGLTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const textureAtlasPosition = gl.getUniformLocation(cameraRenderProgram, "textureAtlas")
    const textureAtlasResolutionPosition = gl.getUniformLocation(cameraRenderProgram, "textureAtlasResolution")
    gl.uniform1i(textureAtlasPosition, 1);
    gl.uniform2f(textureAtlasResolutionPosition, atlas.width, atlas.height);

    // Object.values(foundTextures).forEach(data => {
    //     const locationBox = atlas.getTextureTexelLocation(data.texture.name)
    //     data.indexes.forEach(index => {
    //         shaderInputData[index] = locationBox.col;
    //         shaderInputData[index + 1] = locationBox.row;
    //         shaderInputData[index + 2] = locationBox.width;
    //         shaderInputData[index + 3] = locationBox.height;
    //     })
    // })


    // const texIndexes: Texture[] = Object.values(foundTextures).sort((a, b) => a.index - b.index).map(texData => texData.texture)


    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, cameraLineData.length, 3, 0, gl.RGBA, gl.FLOAT, shaderInputData)
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
