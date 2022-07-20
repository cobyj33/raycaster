import { rawListeners } from "process";
import { Cardinal } from "../enums/Cardinal";
import { ICamera } from "../interfaces/ICamera";
import { Angle } from "./Data/Angle";
import { CameraLine } from "./Data/CameraLine";
import { Color } from "./Data/Color";
import { GameMap } from "./GameMap";
import { LineSegment } from "./Data/LineSegment";
import { Ray } from "./Ray";
import { Vector2 } from "./Data/Vector2";



export class Camera implements ICamera {
    private static standardFOV: Angle = Angle.fromDegrees(70);
    
    readonly map: GameMap;
    readonly position: Vector2;
    readonly direction: Vector2;

    readonly fieldOfView: Angle = Camera.standardFOV;
    readonly viewDistance: number = 50;

    readonly lookingAngle: Angle = Angle.zero;
    readonly moveAmount = 0.25;
    readonly sensitivity = 1;

    constructor(map: GameMap, position: Vector2, direction: Vector2, fov: Angle = Camera.standardFOV, lookingAngle: Angle = Angle.zero) {
        this.map = map;
        this.position = position.clone();
        this.direction = direction.clone();
        this.fieldOfView = fov;
        this.lookingAngle = lookingAngle;
    }

    setDirection(direction: Vector2): Camera {
        return new Camera(this.map, this.position, direction, this.fieldOfView, this.lookingAngle);
    }

    setPosition(position: Vector2): Camera {
        return new Camera(this.map, position, this.direction, this.fieldOfView, this.lookingAngle);
    }

    setMap(map: GameMap): Camera {
        return new Camera(map, this.position, this.direction, this.fieldOfView, this.lookingAngle);
    }

    setFOV(fieldOfView: Angle): Camera {
        return new Camera(this.map, this.position, this.direction, fieldOfView, this.lookingAngle);
    }

    setLookingAngle(lookingAngle: Angle): Camera {
        return new Camera(this.map, this.position, this.direction, this.fieldOfView, lookingAngle);
    }
    
    getCameraPlane(): LineSegment {
        const startingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( this.fieldOfView.degrees / 2.0 )).normalized()  );
        const endingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( -this.fieldOfView.degrees / 2.0 )).normalized()  );
        return new LineSegment(startingCameraPlaneLocation, endingCameraPlaneLocation);
    }

    getRays(lineCount: number, onHit?: () => void, onNoHit?: () => void): Ray[] {
        const rays: Ray[] = [];
        
        const startingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( this.fieldOfView.degrees / 2.0 )).toLength(0.1));
        const endingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( -this.fieldOfView.degrees / 2.0 )).toLength(0.1));
        const perpendicularDirection: Vector2 = endingCameraPlaneLocation.subtract(startingCameraPlaneLocation);
        // const perpendicularDirection: Vector2 = this.direction.rotate(Angle.fromDegrees(90));
        const distanceBetweenStartAndEnd: number = Vector2.distance(startingCameraPlaneLocation, endingCameraPlaneLocation);
        let currentCameraPlaneLocation: Vector2 = startingCameraPlaneLocation.clone();
        
        for (let i = 0; i < lineCount; i++) {
            currentCameraPlaneLocation = currentCameraPlaneLocation.add( perpendicularDirection.toLength( distanceBetweenStartAndEnd / lineCount ) );

            const rayDirection: Vector2 = currentCameraPlaneLocation.subtract(this.position);
            rays.push(new Ray(this.position, rayDirection, () => { onHit?.() }, () => { onNoHit?.() }));
        }

        return rays;
    }

    private castRays(lineCount: number): CameraLine[] {
        const cameraLineData: CameraLine[] = [];
        const startingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( this.fieldOfView.degrees / 2.0 )));
        const endingCameraPlaneLocation: Vector2 = this.position.add(this.direction.rotate(Angle.fromDegrees( -this.fieldOfView.degrees / 2.0 )));
        const perpendicularDirection: Vector2 = endingCameraPlaneLocation.subtract(startingCameraPlaneLocation);
        const distanceBetweenStartAndEnd: number = Vector2.distance(startingCameraPlaneLocation, endingCameraPlaneLocation);
        let currentCameraPlaneLocation: Vector2 = startingCameraPlaneLocation.clone();

        const stepVector: Vector2 = perpendicularDirection.toLength( distanceBetweenStartAndEnd / lineCount );

        for (let i = 0; i < lineCount; i++) {
            if (Vector2.distance(currentCameraPlaneLocation, startingCameraPlaneLocation) > distanceBetweenStartAndEnd) {
                break;
            }
            currentCameraPlaneLocation = currentCameraPlaneLocation.add( stepVector );
            const intersection = currentCameraPlaneLocation.clone();

            const rayDirection: Vector2 = intersection.subtract(this.position);
            const ray: Ray = new Ray(this.position, rayDirection, (hit) => {
                const distanceFromHitToPlane: number = Vector2.distance(intersection, hit.position) * Math.sin( Math.min(Vector2.angleBetween( perpendicularDirection, rayDirection ).radians, Vector2.angleBetween( perpendicularDirection.scale(-1), rayDirection ).radians ) );
                cameraLineData.push(new CameraLine( (1.0 / distanceFromHitToPlane), hit ));
            }, () => { cameraLineData.push(CameraLine.getEmpty()) });
            ray.cast(this.viewDistance, this.map);
        }

        return cameraLineData;
    }

    render(finalCanvas: HTMLCanvasElement): void {
        const canvas = document.createElement("canvas");
        canvas.width = finalCanvas.width;
        canvas.height = finalCanvas.height;

        const cameraLineData: CameraLine[] = this.castRays(canvas.width);
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

        if (context != null) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = 1;
            console.log("looking angle: " + this.lookingAngle);
            const centerHeight: number = Math.trunc(canvas.height / 2 + (Math.tan(this.lookingAngle.radians) * canvas.height / 2));
            context.beginPath();
            let lastColor: Color | null = null;
            context.strokeStyle = 'white';

            for (let col = 0; col < cameraLineData.length; col++) {
                const currentLine: CameraLine = cameraLineData[col];
                if (currentLine.hit != null) {
                    let color: Color = currentLine.hit.hitObject.color();
                    switch(currentLine.hit.side) {
                        case Cardinal.WEST: { color = color.darken(50); break; }
                        case Cardinal.EAST: { color = color.darken(50); break; }
                        case Cardinal.SOUTH: { color = color.darken(100); break; }
                    }

                    if (lastColor !== null) {
                        context.strokeStyle = lastColor.toRGBString();
                        if (!color.equals(lastColor)) {
                            context.stroke();
                            context.beginPath();
                        }
                    }
                    lastColor = color;
                } else {
                    context.strokeStyle = 'white';
                }



                const lineHeightInPixels: number = Math.trunc(currentLine.lineLengthPercentage * canvas.height);
                context.moveTo(col, Math.trunc(centerHeight - ( lineHeightInPixels / 2)) );
                context.lineTo(col, Math.trunc(centerHeight + ( lineHeightInPixels / 2)) );
            }
            context.stroke();
        }


        const finalCanvasContext: CanvasRenderingContext2D | null = finalCanvas.getContext("2d");
        if (finalCanvasContext !== null && finalCanvasContext !== undefined) {
            finalCanvasContext.drawImage(canvas, 0, 0);
        }
    }

    toString(): string {
        return ` [Camera: {
            Position: ${this.position},
            Direction: ${this.direction},
            FOV: ${this.fieldOfView},
            viewDistance: ${this.viewDistance}
        }]`
    }


}