import { rawListeners } from "process";
import { Cardinal } from "../enums/Cardinal";
import { ICamera } from "../interfaces/ICamera";
import { Angle } from "./Angle";
import { CameraLine } from "./CameraLine";
import { Color } from "./Color";
import { GameMap } from "./GameMap";
import { LineSegment } from "./LineSegment";
import { Ray } from "./Ray";
import { Vector2 } from "./Vector2";



export class Camera implements ICamera {
    
    readonly map: GameMap;
    readonly position: Vector2;
    readonly direction: Vector2;

    readonly fieldOfView: Angle = Angle.fromDegrees(70);
    readonly viewDistance: number = 50;

    constructor(map: GameMap, position: Vector2, direction: Vector2, fov: Angle = Angle.fromDegrees(70)) {
        this.map = map;
        this.position = position.clone();
        this.direction = direction.clone();
        this.fieldOfView = fov;
    }

    setDirection(direction: Vector2): Camera {
        return new Camera(this.map, this.position, direction, this.fieldOfView);
    }

    setPosition(position: Vector2): Camera {
        return new Camera(this.map, position, this.direction, this.fieldOfView);
    }

    setMap(map: GameMap): Camera {
        return new Camera(map, this.position, this.direction, this.fieldOfView);
    }

    setFOV(fov: Angle): Camera {
        return new Camera(this.map, this.position, this.direction, fov);
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
                const distanceFromHitToPlane: number = Vector2.distance(intersection, hit.position) * Math.sin( Math.min(Vector2.angleBetween( perpendicularDirection, rayDirection ).radians, Vector2.angleBetween( perpendicularDirection.toLength(-1), rayDirection ).radians ) );
                cameraLineData.push(new CameraLine( (1.0 / distanceFromHitToPlane), hit ));
            }, () => { cameraLineData.push(CameraLine.getEmpty()) });
            ray.cast(this.viewDistance, this.map);
        }

        return cameraLineData;
    }

    render(canvas: HTMLCanvasElement): void {
        const cameraLineData: CameraLine[] = this.castRays(canvas.width);
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

        if (context != null) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = 1;
            const centerHeight: number = canvas.height / 2;
            context.beginPath();

            for (let col = 0; col < cameraLineData.length; col++) {
                const currentLine: CameraLine = cameraLineData[col];
                context.strokeStyle = 'white';
                // if (currentLine.hit != null) {
                //     let color: Color = currentLine.hit.hitObject.color();
                //     switch(currentLine.hit.side) {
                //         case Cardinal.WEST: { color = color.darken(50); break; }
                //         case Cardinal.EAST: { color = color.darken(50); break; }
                //         case Cardinal.SOUTH: { color = color.darken(100); break; }
                //     }
                //     context.strokeStyle = color.toRGBString();
                // } else {
                //     context.strokeStyle = 'white';
                // }

                const lineHeightInPixels: number = currentLine.lineLengthPercentage * canvas.height;
                context.moveTo(col, centerHeight - ( lineHeightInPixels / 2));
                context.lineTo(col, centerHeight + ( lineHeightInPixels / 2));
            }
            context.stroke();
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

// public class Camera : IPositionable, IDrawable {\
//     public void Render() {
//         cameraLineData = new List<CameraLine>();

        
//         Vector2Double startingCameraPlaneLocation = position + direction.RotateDegrees(FOV / 2.0).ToLength(0.1);
//         Vector2Double endingCameraPlaneLocation =  position + direction.RotateDegrees(360 - FOV / 2.0).ToLength(0.1);
//         Vector2Double middleCameraPlaneLocation = Vector2Double.Midpoint(startingCameraPlaneLocation, endingCameraPlaneLocation);

//         Vector2Double perpendicularDirection = endingCameraPlaneLocation - startingCameraPlaneLocation;
//         double distanceBetweenStartAndEnd = Vector2Double.Distance(startingCameraPlaneLocation, endingCameraPlaneLocation);
//         double distanceFromPlaneToCamera = Vector2Double.Distance(this.position, middleCameraPlaneLocation);
//         Vector2Double currentCameraPlaneLocation = startingCameraPlaneLocation;


//         for (int i = 0; i < LineCount; i++) {
//             currentCameraPlaneLocation += perpendicularDirection.ToLength(distanceBetweenStartAndEnd / LineCount);
//             if (cameraLineData.Count >= LineCount) {
//                 break;
//             }

//             Vector2Double rayDirection = currentCameraPlaneLocation - position;
//             Ray ray = new Ray(this.position, rayDirection, (hit) => { //changed distance from currentCameraPlaneLocation to position. The actual rendering plane now lies perpendicular to the direction of the camera and through the camera's position
//                 double distanceFromHitToPlane = Vector2Double.Distance(currentCameraPlaneLocation, hit.Position) * Math.Sin( Vector2Double.AngleBetween( perpendicularDirection, rayDirection  ) );
//                 cameraLineData.Add( new CameraLine(hit, (1.0d / distanceFromHitToPlane ) ) );
//             }, () => { cameraLineData.Add( CameraLine.Empty ); }  );
//             ray.Cast(viewDistance, map);
//         }
//     }

//     public char CardinalToChar(Cardinal cardinal) {
//         switch (cardinal) {
//             case Cardinal.NORTH: return '$';
//             case Cardinal.EAST: return '@';
//             case Cardinal.SOUTH: return '-';
//             case Cardinal.WEST: return '*';
//             default: return '%';
//         }
//     }

//     public void Display() {
//         Console.Clear();
//         int height = Console.BufferHeight;
//         int centerHeight = height / 2;
//         int width = cameraLineData.Count;
//         List<int> lineHeights = cameraLineData.Select(lineData => (int)(lineData.LineLengthPercentage * height)).ToList();

//         StringBuilder builder = new StringBuilder();
//         for (int row = 0; row < height; row++) {
//             int distanceFromCenter = Math.Abs(row - centerHeight);
//             for (int col = 0; col < width; col++) {
//                 if (lineHeights[col] / 2 > distanceFromCenter) {
//                     CameraLine currentLine = cameraLineData[col];
//                     if (currentLine.Hit.HasValue) {
//                         builder.Append(CardinalToChar(currentLine.Hit.Value.Side));
//                     }
//                 } else {
//                     builder.Append(' ');
//                 }
//             }
//             builder.AppendLine();
//         }

//         Console.WriteLine(builder.ToString());
//     }

//     public override string ToString()
//     {
//         return $"[Camera] Direction: { direction }, Position: { position } ";
//     }
// }