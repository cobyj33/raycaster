import { PointerEvent, Ref, RefObject, useCallback, useEffect, useRef, useState, WheelEvent } from 'react'
import { tryPlaceCamera, rgbToString, StatefulData, getCameraPlane, castRay, Ray, GameMap, Camera, getCameraRays, RaycastHit, RaycastNoHit } from "raycaster/interfaces";
import { IVector2, translateVector2, addVector2, vector2Int, scaleVector2, vector2ToAngle, vector2ToLength, subtractVector2, vector2Normalized, distanceBetweenVector2 } from "raycaster/interfaces";
import { useKeyHandler } from 'raycaster/keysystem';
import { MenuSelector, MenuSelection } from "raycaster/components"
import { GenerationAlgorithm, getGenerationAlgorithm } from "raycaster/generation"
import { BirdsEyeCameraControls } from "raycaster/controls";
import "components/styles/mapscreen.css";
import { TouchControls } from "raycaster/components";
import cam from "assets/Camera.png"
import { useResizeObserver } from "raycaster/functions";

const cameraImage = new Image();
let cameraLoaded = false;
cameraImage.onload = () => cameraLoaded = true;
cameraImage.src = cam;

export const MapScreen = ({ mapData, cameraData }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera> }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const canvasHolderRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    const [camera, setCamera] = cameraData;
    const [cursor, setCursor] = useState<string>("pointer");
    const isPointerDown = useRef<boolean>(false);
    const isCameraGrabbed = useRef<boolean>(false);
    const lastPointerPosition = useRef<IVector2>({row: 0, col: 0});
    const [map, setMap] = mapData;
    const cameraControls = useKeyHandler(new BirdsEyeCameraControls(setCamera));
    // const containerRef = useRef<HTMLDivElement>(null);

    const getMapScale: () => number = useCallback(() => {
        return canvasRef.current !== null && canvasRef.current !== undefined ? Math.min( canvasRef.current.clientWidth / map.dimensions.row, canvasRef.current.clientHeight / map.dimensions.col ) : 1;
    }, [map]);

    const pointerPositionInCanvas = (event: PointerEvent<Element>): IVector2 => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
            return {
                row: Math.trunc(event.clientY - canvasBounds.y),
                col: Math.trunc(event.clientX - canvasBounds.x)
            }
        }
        return { row: 0, col: 0  };
      }

    const getHoveredCell: (event: PointerEvent<Element>) => IVector2 = (event: PointerEvent<Element>) => {
        const position: IVector2 = pointerPositionInCanvas(event);
        // return new IVector2(Math.floor(position.row / getMapScale()), Math.floor(position.col / getMapScale()) );
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
                context.fillStyle = rgbToString(map.tiles[row][col].color);
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
            const offsetDirection = addVector2(vector2ToLength(camera.direction, -cameraImage.height), { row: 0, col: cameraImage.width / 4 });// camera.direction.toLength(-cameraImage.height).add(new IVector2(0, cameraImage.width / 4));
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


        const rays: Ray[] = getCameraRays(camera, 200);
        rays.forEach(ray => {
            const result: RaycastHit | RaycastNoHit = castRay(ray, camera.map, camera.viewDistance);
            if ("hitObject" in result) { // is a RaycastHit object
                const hit = result as RaycastHit
                context.moveTo(hit.originalRay.origin.col * getMapScale(), hit.originalRay.origin.row * getMapScale());
                context.lineTo(hit.end.col * getMapScale(), hit.end.row * getMapScale());
            } else {
                const noHit = result as RaycastNoHit
                context.moveTo(noHit.originalRay.origin.col * getMapScale(), noHit.originalRay.origin.row * getMapScale());
                context.lineTo(noHit.end.col * getMapScale(), noHit.end.row * getMapScale());
            }
        })



        context.stroke();
        context.restore();
    }, [camera, getMapScale]);

    const renderCameraPlane = useCallback((context: CanvasRenderingContext2D) => {
        context.save();
        context.beginPath();
        context.strokeStyle = 'blue';
        const cameraPlane: { start: IVector2, end: IVector2 } = getCameraPlane(camera);
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
                context.clearRect(0, 0, canvas.width, canvas.height);
                renderMap(context);
                renderCamera(context);
                renderRays(context);
                renderCameraPlane(context);
                renderPointerLine(context);
            }
        }
    }, [renderCamera, renderMap, renderRays, renderCameraPlane, renderPointerLine]);
    

    useEffect(render, [render])
    useResizeObserver(canvasHolderRef, updateCanvasSize);

    function updateCanvasSize() {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const canvasHolder: HTMLDivElement | null = canvasHolderRef.current;
        if (canvas === null || canvas === undefined) return;
        if (canvasHolder === null || canvasHolder === undefined) return;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if (context === null || context === undefined) return;

        const rect: DOMRect = canvas.getBoundingClientRect();
        if (rect.width !== canvas.width || rect.height !== canvas.height) {
            const imageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = rect.width;
            canvas.height = rect.height;
            context.putImageData(imageData, 0, 0);
        } else {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        render();
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
        console.log(getMapScale());
        if (distanceBetweenVector2(vector2Int(hoveredCell), vector2Int(camera.position)) <= 10 / getMapScale()) {
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


	const [generationMenuIndex, setGenerationMenuIndex] = useState<number>(0);

	const generationAlgorithms = useRef<GenerationAlgorithm[]>([getGenerationAlgorithm("Recursive Backtracker"), getGenerationAlgorithm("Kruskal")]);

    return (
    <div className="map-container screen" onKeyDown={(event) => cameraControls.current.onKeyDown(event)} onKeyUp={(event) => cameraControls.current.onKeyUp(event)} tabIndex={0}>

        <div className="map-canvas-holder" ref={canvasHolderRef}>
        <canvas style={{cursor: cursor}} className="map-canvas" onWheel={onWheel} onPointerCancel={onPointerCancel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove}  onTouchStart={() => setShowTouchControls(true)} ref={canvasRef} width={map.dimensions.row * getMapScale()} height={map.dimensions.row * getMapScale()}> </canvas>
        </div>

        {showTouchControls && <TouchControls cameraData={cameraData} />}

	<MenuSelector sendMenuIndex={(index) => setGenerationMenuIndex(index)}>
		{ generationAlgorithms.current.map( (algo, index) => (
            <MenuSelection className={`algorithm-menu-selection ${generationMenuIndex === index ? "selected" : "unselected"}`} name={algo.name} key={`algorithmSelection ${algo.name}` }>
            { /* <GenerationMenu algo={algo} /> */ }
                <button className="algorithm-generation-button" onClick={() => setMap(map => algo.generateMap(map.dimensions))}> Generate {algo.name} </button>
            </MenuSelection> )  ) } 
	</MenuSelector>
    </div>
  )
}
