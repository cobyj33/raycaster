import React, { RefObject, useEffect, useRef } from 'react'
import { Camera } from '../classes/Camera';
import { Dimension } from '../classes/Dimension';
import { GameMap } from '../classes/GameMap'
import { LineSegment } from '../classes/LineSegment';
import { Ray } from '../classes/Ray';
import { WallTile } from '../classes/Tiles/WallTile';
import { StatefulData } from '../interfaces/StatefulData'

export const MapScreen = ({ mapData, cameraData }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera> }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = cameraData;
    const mapScale = 10;

    function render() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
            if (context !== null && context !== undefined) {
                const mapDimensions: Dimension = mapData[0].Dimensions;
                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = mapDimensions.cols * mapScale;
                canvas.height = mapDimensions.rows * mapScale;
                for (let row = 0; row < mapDimensions.rows; row++) {
                    for (let col = 0; col < mapDimensions.cols; col++) {
                        context.fillStyle = mapData[0].at(row, col).color().toRGBString();
                        context.fillRect(col * mapScale, row * mapScale, mapScale, mapScale);
                    }
                }

                context.fillStyle = 'red';
                context.fillRect(camera.position.col * mapScale, camera.position.row * mapScale, 1 * mapScale, 1 * mapScale)
                
                context.beginPath();
                context.strokeStyle = 'green';
                const rays: Ray[] = camera.getRays(100);
                rays.forEach(ray => {
                    if (ray.end !== null && ray.end !== undefined) {
                        context.moveTo(camera.position.col * mapScale, camera.position.row * mapScale);
                        context.lineTo(ray.end.col * mapScale, ray.end.row * mapScale);
                    }
                })
                context.stroke();

                context.beginPath();
                context.strokeStyle = 'blue';
                const cameraPlane: LineSegment = camera.getCameraPlane();
                console.log(cameraPlane);
                context.moveTo(cameraPlane.start.col * mapScale, cameraPlane.start.row * mapScale);
                context.lineTo(cameraPlane.end.col * mapScale, cameraPlane.end.row * mapScale);
                context.stroke();

            }
        }   
    }
    
    useEffect( () => {
        render();
        // setTimeout(() => mapData[1](mapData[0].placeTile(new WallTile(), Math.floor(Math.random() * mapData[0].Dimensions.rows),  Math.floor(Math.random() * mapData[0].Dimensions.cols) )), 500);
    })


    return (
    <div>
        <canvas ref={canvasRef} width={mapData[0].Dimensions.rows * mapScale} height={mapData[0].Dimensions.rows * mapScale}> </canvas>
    </div>
  )
}
