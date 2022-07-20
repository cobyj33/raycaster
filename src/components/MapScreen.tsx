import React, { PointerEvent, RefObject, useEffect, useRef, useState, WheelEvent } from 'react'
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
import { Vector2 } from '../classes/Data/Vector2';
import cam from "../assets/Camera.png"
import { useWindowEvent } from '../functions/useWindowEvent';

const cameraImage = new Image();
let cameraLoaded = false;
cameraImage.onload = () => cameraLoaded = true;
cameraImage.src = cam;

export const MapScreen = ({ mapData, cameraData }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera> }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    const [camera, setCamera] = cameraData;
    const [cursor, setCursor] = useState<string>("pointer");
    const isPointerDown = useRef<boolean>(false);
    const isCameraGrabbed = useRef<boolean>(false);
    const lastPointerPosition = useRef<Vector2>(Vector2.zero);
    const [map, setMap] = mapData;
    const cameraControls = useKeyHandler(new BirdsEyeCameraControls(setCamera));
    const containerRef = useRef<HTMLDivElement>(null);
    const getMapScale: () => number = () => containerRef.current !== null && containerRef !== undefined ? Math.min( containerRef.current.clientWidth / map.Dimensions.rows, containerRef.current.clientHeight / map.Dimensions.cols ) : 1;

    const pointerPositionInCanvas = (event: PointerEvent<Element>): Vector2 => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
          return new Vector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
        }
        return new Vector2(0, 0);
      }

    const getHoveredCell: (event: PointerEvent<Element>) => Vector2 = (event: PointerEvent<Element>) => {
        const position: Vector2 = pointerPositionInCanvas(event);
        return new Vector2(Math.floor(position.row / getMapScale()), Math.floor(position.col / getMapScale()) );
    }

    function render() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
            if (context !== null && context !== undefined) {
                renderMap(canvas, context);
                renderCamera(canvas, context);
                renderRays(canvas, context);
                renderCameraPlane(canvas, context);
                renderPointerLine(canvas, context);
            }
        }
    }
    
    function renderMap(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
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
    }

    function renderPointerLine(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        if (!lastPointerPosition.current.equals(Vector2.zero)) {
            context.save();
            context.strokeStyle = 'yellow'
            context.setLineDash([1, 1]);
            context.beginPath();
            const cameraPositionOnMap = camera.position.scale(getMapScale())
            context.moveTo(cameraPositionOnMap.col, cameraPositionOnMap.row);
            context.lineTo(lastPointerPosition.current.col, lastPointerPosition.current.row);
            context.stroke();
            context.restore();
        }
    }

    function renderCamera(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        context.save();
        if (cameraLoaded) {
            context.transform(1, 0, 0, 1, Math.trunc(camera.position.col * getMapScale()), Math.trunc(camera.position.row * getMapScale()));
            const offsetDirection = camera.direction.toLength(-cameraImage.height).add(new Vector2(0, cameraImage.width / 4));
            context.translate(offsetDirection.col, offsetDirection.row);
            context.rotate(-camera.direction.toAngle().radians + Math.PI / 2)
            context.drawImage(cameraImage, -cameraImage.width / 2, -cameraImage.height / 2);
        } else {
            context.fillStyle = 'red';
            context.fillRect(camera.position.col * getMapScale(), camera.position.row * getMapScale(), 0.25 * getMapScale(), 0.25 * getMapScale());
        }
        context.restore();
    }

    function renderRays(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        context.save();
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
        context.restore();
    }

    function renderCameraPlane(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.strokeStyle = 'blue';
        const cameraPlane: LineSegment = camera.getCameraPlane();
        context.moveTo(cameraPlane.start.col * getMapScale(), cameraPlane.start.row * getMapScale());
        context.lineTo(cameraPlane.end.col * getMapScale(), cameraPlane.end.row * getMapScale());
        context.stroke();
        context.restore();
    }

    
    useEffect(render, [camera, map])
    useWindowEvent('resize', updateCanvasSize);

    function updateCanvasSize() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
          const canvas: HTMLCanvasElement = canvasRef.current;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          render();
        }
      }

    function faceCameraToPointer(event: PointerEvent<Element>) {
            const cameraPosition = camera.position.scale(getMapScale());
            const pointerPosition = pointerPositionInCanvas(event);
            if (!cameraPosition.equals(pointerPosition)) {
                setCamera(camera => camera.setDirection(pointerPosition.subtract(cameraPosition).normalized()));
            }
    }

    function onPointerMove(event: PointerEvent<Element>) {
        if (isPointerDown.current && isCameraGrabbed.current) {
            const pointerPosition = pointerPositionInCanvas(event);
            const scaledPointerPosition = pointerPosition.scale(1 / getMapScale());
            if (map.inBounds(scaledPointerPosition.row, scaledPointerPosition.col)) {
                setCamera(camera => camera.setPosition(scaledPointerPosition));
            }
        } else if (isPointerDown.current && !isCameraGrabbed.current) {
            faceCameraToPointer(event);
        }
        lastPointerPosition.current = pointerPositionInCanvas(event);
        render();
    }

    function onPointerDown(event: PointerEvent<Element>) {
        isPointerDown.current = true;
        const hoveredCell = getHoveredCell(event);
        if (Vector2.distance(hoveredCell.int(), camera.position.int()) <= 1.5) {
            isCameraGrabbed.current = true;
            setCursor('move');
        } else {
            faceCameraToPointer(event);
        }
        lastPointerPosition.current = pointerPositionInCanvas(event);
    }

    function reset() {
        isPointerDown.current = false;
        isCameraGrabbed.current = false;
        lastPointerPosition.current = Vector2.zero;

        const cameraCell = camera.position.int();
        if (map.at(cameraCell.row, cameraCell.col).canCollide()) {
            let found = false;
            const searchQueue: Vector2[] = [];
            const visited: Set<string> = new Set<string>();
            searchQueue.push(cameraCell);
            visited.add(JSON.stringify(cameraCell));
            let current = cameraCell;
            while (searchQueue.length > 0 && !found) {
                current = searchQueue.splice(0, 1)[0];
                if (map.inBounds(current.row, current.col)) {
                    if (map.at(current.row, current.col).canCollide() === false) {
                        found = true;
                        break;
                    }
                }

                const neighbors: Vector2[] = [current.translate(1, 0), current.translate(0, 1), current.translate(-1, 0), current.translate(0, -1)].filter(cell => !visited.has(JSON.stringify(cell)));
                neighbors.forEach(cell => {
                    visited.add(JSON.stringify(cell));
                    searchQueue.push(cell);
                });
            }

            setCamera(camera => camera.setPosition(current));
        }

        setCursor('pointer');
    }

    function onPointerUp(event: PointerEvent<Element>) { reset(); }
    function onPointerLeave(event: PointerEvent<Element>) { reset(); }
    function onPointerCancel(event: PointerEvent<Element>) { reset(); }

    function onWheel(event: WheelEvent<Element>) {
        console.log(event.deltaY);
        setCamera(camera => camera.setFOV(camera.fieldOfView.add( Angle.fromDegrees(event.deltaY / 50))));
    }


    return (
    <div ref={containerRef} className="map-container screen" onKeyDown={(event) => cameraControls.current.onKeyDown(event)} onKeyUp={(event) => cameraControls.current.onKeyUp(event)} tabIndex={0}>
        <canvas style={{cursor: cursor}} className="map-canvas" onWheel={onWheel} onPointerCancel={onPointerCancel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove}  onTouchStart={() => setShowTouchControls(true)} ref={canvasRef} width={map.Dimensions.rows * getMapScale()} height={map.Dimensions.rows * getMapScale()}> </canvas>

        {showTouchControls && <TouchControls cameraData={cameraData} />}

        <div className="camera-manipulation">

        </div>
    </div>
  )
}
