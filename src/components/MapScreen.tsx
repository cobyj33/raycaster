import React, { RefObject, useEffect, useRef, useState } from 'react'
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera';
import { BirdsEyeCameraControls } from '../classes/CameraControls';
import { Dimension } from '../classes/Data/Dimension';
import { GameMap } from '../classes/GameMap'
import { useKeyHandler } from '../classes/KeySystem/KeyHandler';
import { LineSegment } from '../classes/Data/LineSegment';
import { Ray } from '../classes/Ray';
import { WallTile } from '../classes/Tiles/WallTile';
import { StatefulData } from '../interfaces/StatefulData'
import "./mapscreen.css";
import { useResizeObserver } from '../functions/useResizeObserver';
import { TouchControls } from './TouchControls';

export const MapScreen = ({ mapData, cameraData }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera> }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    const [camera, setCamera] = cameraData;
    const [map, setMap] = mapData;
    const cameraControls = useKeyHandler(new BirdsEyeCameraControls(setCamera));
    const containerRef = useRef<HTMLDivElement>(null);
    const getMapScale: () => number = () => containerRef.current !== null && containerRef !== undefined ? Math.min( containerRef.current.clientWidth / map.Dimensions.rows, containerRef.current.clientHeight / map.Dimensions.cols ) : 1;

    function render() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
            if (context !== null && context !== undefined) {
                const mapDimensions: Dimension = map.Dimensions;
                context.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = mapDimensions.cols * getMapScale();
                canvas.height = mapDimensions.rows * getMapScale();
                for (let row = 0; row < mapDimensions.rows; row++) {
                    for (let col = 0; col < mapDimensions.cols; col++) {
                        context.fillStyle = map.at(row, col).color().toRGBString();
                        context.fillRect(col * getMapScale(), row * getMapScale(), getMapScale(), getMapScale());
                    }
                }

                context.fillStyle = 'red';
                context.fillRect(camera.position.col * getMapScale(), camera.position.row * getMapScale(), 1 * getMapScale(), 1 * getMapScale())
                
                context.beginPath();
                context.strokeStyle = 'green';
                const rays: Ray[] = camera.getRays(200);
                rays.forEach(ray => {
                    ray.cast(camera.viewDistance, camera.map);
                    if (ray.end !== null && ray.end !== undefined) {
                        context.moveTo(camera.position.col * getMapScale(), camera.position.row * getMapScale());
                        context.lineTo(ray.end.col * getMapScale(), ray.end.row * getMapScale());
                    }
                })
                context.stroke();

                context.beginPath();
                context.strokeStyle = 'blue';
                const cameraPlane: LineSegment = camera.getCameraPlane();
                context.moveTo(cameraPlane.start.col * getMapScale(), cameraPlane.start.row * getMapScale());
                context.lineTo(cameraPlane.end.col * getMapScale(), cameraPlane.end.row * getMapScale());
                context.stroke();
            }
        }   
    }
    
    useEffect(render, [camera, map])

    function updateCanvasSize() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
          const canvas: HTMLCanvasElement = canvasRef.current;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      }



    return (
    <div ref={containerRef} className="map-container" onKeyDown={(event) => cameraControls.current.onKeyDown(event)} onKeyUp={(event) => cameraControls.current.onKeyUp(event)} tabIndex={0}>
        <canvas onTouchStart={() => setShowTouchControls(true)} ref={canvasRef} width={map.Dimensions.rows * getMapScale()} height={map.Dimensions.rows * getMapScale()}> </canvas>

        {showTouchControls && <TouchControls cameraData={cameraData} />}
    </div>
  )
}
