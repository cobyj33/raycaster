import { PointerEvent, RefObject, useCallback, useEffect, useRef, useState, WheelEvent } from 'react'
import { tryPlaceCamera, colorToRGBString, StatefulData, getCameraPlane, castRay, Ray, GameMap, Camera, getCameraRays } from "raycaster/interfaces";
import { Vector2, translateVector2, addVector2, vector2Int, scaleVector2, vector2ToAngle, vector2ToLength, subtractVector2, vector2Normalized, distanceBetweenVector2 } from "raycaster/interfaces";
import { useKeyHandler } from 'raycaster/keysystem';
import { GenerationMenu, MenuSelector, MenuSelection } from "raycaster/components"
import { GenerationAlgorithm, getGenerationAlgorithm } from "raycaster/generation"
import { BirdsEyeCameraControls } from "raycaster/controls";
import "./styles/mapscreen.scss";
import { TouchControls } from "raycaster/components";
import cam from "assets/Camera.png"
import { useWindowEvent } from "raycaster/functions";

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
    const lastPointerPosition = useRef<Vector2>({row: 0, col: 0});
    const [map, setMap] = mapData;
    const cameraControls = useKeyHandler(new BirdsEyeCameraControls(setCamera));
    const containerRef = useRef<HTMLDivElement>(null);
    const getMapScale: () => number = useCallback(() => containerRef.current !== null && containerRef !== undefined ? Math.min( containerRef.current.clientWidth / map.dimensions.row, containerRef.current.clientHeight / map.dimensions.col ) : 1, [map]);

    const pointerPositionInCanvas = (event: PointerEvent<Element>): Vector2 => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
          // return new Vector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
            return {
                row: Math.trunc(event.clientY - canvasBounds.y),
                col: Math.trunc(event.clientX - canvasBounds.x)
            }
        }
        return { row: 0, col: 0  };
      }

    const getHoveredCell: (event: PointerEvent<Element>) => Vector2 = (event: PointerEvent<Element>) => {
        const position: Vector2 = pointerPositionInCanvas(event);
        // return new Vector2(Math.floor(position.row / getMapScale()), Math.floor(position.col / getMapScale()) );
        return {
            row: Math.floor(position.row / getMapScale()),
            col: Math.floor(position.col / getMapScale())
        }
    }

    const renderMap = useCallback((context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.canvas.width = map.dimensions.col * getMapScale();
        context.canvas.height = map.dimensions.row * getMapScale();
        for (let row = 0; row < map.dimensions.row; row++) {
            for (let col = 0; col < map.dimensions.col; col++) {
                context.fillStyle = colorToRGBString(map.tiles[row][col].color);
                context.fillRect(col * getMapScale(), row * getMapScale(), getMapScale(), getMapScale());
            }
        }
    }, [getMapScale, map]);

    const renderPointerLine = useCallback((context: CanvasRenderingContext2D) => {
        if (!(lastPointerPosition.current.row === 0 && lastPointerPosition.current.col === 0)) {
            context.save();
            context.strokeStyle = 'yellow'
            context.setLineDash([1, 1]);
            context.beginPath();
            const cameraPositionOnMap = scaleVector2(camera.position, getMapScale());
            context.moveTo(cameraPositionOnMap.col, cameraPositionOnMap.row);
            context.lineTo(lastPointerPosition.current.col, lastPointerPosition.current.row);
            context.stroke();
            context.restore();
        }
    }, [camera, getMapScale]);

    const renderCamera = useCallback((context: CanvasRenderingContext2D) => {
        context.save();
        if (cameraLoaded) {
            context.transform(1, 0, 0, 1, Math.trunc(camera.position.col * getMapScale()), Math.trunc(camera.position.row * getMapScale()));
            const offsetDirection = addVector2(vector2ToLength(camera.direction, -cameraImage.height), { row: 0, col: cameraImage.width / 4 });// camera.direction.toLength(-cameraImage.height).add(new Vector2(0, cameraImage.width / 4));
            context.translate(offsetDirection.col, offsetDirection.row);
            context.rotate(-vector2ToAngle(camera.direction) + Math.PI / 2)
            context.drawImage(cameraImage, -cameraImage.width / 2, -cameraImage.height / 2);
        } else {
            context.fillStyle = 'red';
            context.fillRect(camera.position.col * getMapScale(), camera.position.row * getMapScale(), 0.25 * getMapScale(), 0.25 * getMapScale());
        }
        context.restore();
    }, [camera, getMapScale]);

    const renderRays = useCallback((context: CanvasRenderingContext2D) => {
        context.save();
        context.beginPath();
        context.strokeStyle = 'green';
        const rays: Ray[] = getCameraRays(camera, 200, (hit) => {
                context.moveTo(hit.originalRay.origin.col * getMapScale(), hit.originalRay.origin.row * getMapScale());
                context.lineTo(hit.position.col * getMapScale(), hit.position.row * getMapScale());
        }, (noHit) => {
                context.moveTo(noHit.originalRay.origin.col * getMapScale(), noHit.originalRay.origin.row * getMapScale());
                context.lineTo(noHit.end.col * getMapScale(), noHit.end.row * getMapScale());
            }
);
        rays.forEach(ray => {
            castRay(ray, camera.map, camera.viewDistance);
        })

        context.stroke();
        context.restore();
    }, [camera, getMapScale]);

    const renderCameraPlane = useCallback((context: CanvasRenderingContext2D) => {
        context.save();
        context.beginPath();
        context.strokeStyle = 'blue';
        const cameraPlane: { start: Vector2, end: Vector2 } = getCameraPlane(camera);
        context.moveTo(cameraPlane.start.col * getMapScale(), cameraPlane.start.row * getMapScale());
        context.lineTo(cameraPlane.end.col * getMapScale(), cameraPlane.end.row * getMapScale());
        context.stroke();
        context.restore();
    }, [camera, getMapScale]);

    const render = useCallback( () => {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
            if (context !== null && context !== undefined) {
                renderMap(context);
                renderCamera(context);
                renderRays(context);
                renderCameraPlane(context);
                renderPointerLine(context);
            }
        }
    }, [renderCamera, renderMap, renderRays, renderCameraPlane, renderPointerLine]);
    

    
    
    useEffect(render, [render])
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
            // const cameraPosition = camera.position.scale(getMapScale());
            const cameraPosition = scaleVector2(camera.position, getMapScale());
            
            const pointerPosition = pointerPositionInCanvas(event);
            if (!(cameraPosition.row === pointerPosition.row && cameraPosition.col === pointerPosition.col)) {

                // setCamera(camera => camera.setDirection(pointerPosition.subtract(cameraPosition).normalized()));
                setCamera(camera => ({
                    ...camera,
                    direction: vector2Normalized(subtractVector2(pointerPosition, cameraPosition))
                }))
            }
    }

    function onPointerMove(event: PointerEvent<Element>) {
        if (isPointerDown.current && isCameraGrabbed.current) {
            const pointerPosition = pointerPositionInCanvas(event);
            const scaledPointerPosition = scaleVector2(pointerPosition, 1 / getMapScale());
            if (scaledPointerPosition.row >= 0 && scaledPointerPosition.col >= 0 && scaledPointerPosition.row < map.tiles.length && scaledPointerPosition.col < map.tiles[0].length) {
                // setCamera(camera => camera.setPosition(scaledPointerPosition));
                setCamera(camera => ( { ...camera, position: scaledPointerPosition } ))
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
        if (distanceBetweenVector2(vector2Int(hoveredCell), vector2Int(camera.position)) <= 1.5) {
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
        lastPointerPosition.current = { row: 0, col: 0 };

        setCamera( (camera: Camera) => ({...camera, position: tryPlaceCamera(camera, camera.position)}) );

        setCursor('pointer');
    }

    function onPointerUp() { reset(); }
    function onPointerLeave() { reset(); }
    function onPointerCancel() { reset(); }

    function onWheel(event: WheelEvent<Element>) {
        // console.log(event.deltaY);
        // setCamera(camera => camera.setFOV(camera.fieldOfView.add( Angle.fromDegrees(event.deltaY / 50))));
        setCamera( camera => ({
            ...camera,
            fieldOfView: camera.fieldOfView + (event.deltaY / 50 * Math.PI / 180.0)
        }) )
    }

	
	const generationAlgorithms = useRef<GenerationAlgorithm[]>([getGenerationAlgorithm("Recursive Backtracker"), getGenerationAlgorithm("Kruskal")]);

    return (
    <div ref={containerRef} className="map-container screen" onKeyDown={(event) => cameraControls.current.onKeyDown(event)} onKeyUp={(event) => cameraControls.current.onKeyUp(event)} tabIndex={0}>
        <canvas style={{cursor: cursor}} className="map-canvas" onWheel={onWheel} onPointerCancel={onPointerCancel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove}  onTouchStart={() => setShowTouchControls(true)} ref={canvasRef} width={map.dimensions.row * getMapScale()} height={map.dimensions.row * getMapScale()}> </canvas>

        {showTouchControls && <TouchControls cameraData={cameraData} />}

	<MenuSelector>
		{ generationAlgorithms.current.map( algo => ( <MenuSelection name={algo.name} key={`algorithmSelection ${algo.name}` } > <GenerationMenu algo={algo} /> <button onClick={() => setMap(map => algo.generateMap(map.dimensions))}> {algo.name} </button> </MenuSelection> )  ) } 
	</MenuSelector>
    </div>
  )
}
