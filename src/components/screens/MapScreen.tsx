import { KeyboardEvent, PointerEvent, RefObject, useEffect, useRef, useState, WheelEvent } from 'react'
import { tryPlaceCamera, rgbToString, StatefulData, getCameraPlane, castRay, Ray, GameMap, Camera, getCameraRays, RaycastHit, RaycastNoHit, View, ILineSegment, LineSegment } from "raycaster/interfaces";
import { Vector2, IVector2, translateVector2, addVector2, vector2Int, scaleVector2, vector2ToAngle, vector2ToLength, subtractVector2, vector2Normalized, distanceBetweenVector2 } from "raycaster/interfaces";
import { useKeyHandler } from 'raycaster/keysystem';
import { MenuSelector, MenuSelection } from "raycaster/components"
import { GenerationAlgorithm, getGenerationAlgorithm } from "raycaster/generation"
import { BirdsEyeCameraControls } from "raycaster/controls";
import mapScreenStyles from "components/styles/MapScreen.module.css";
import { TouchControls } from "raycaster/components";
import cam from "assets/Camera.png"
import { useResizeObserver } from "raycaster/functions";
import { getCanvasAndContext } from 'functions/util';

const cameraImage = new Image();
let cameraLoaded = false;
cameraImage.onload = () => cameraLoaded = true;
cameraImage.src = cam;

interface MapScreenState {
    showTouchControls: boolean
    isPointerDown: boolean
    isCameraGrabbed: boolean
    view: View
}

export const MapScreen = ({ mapData, cameraData }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera> }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const canvasHolderRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    const [camera, setCamera] = cameraData;

    /** the amount of map rows and columns that the view is offset
     * NOTE: THE "row" and "column" VALUES ARE RELATIVE TO THE ACTUAL GAME MAP, NOT THE PIXELS OF THE SCREEN VIEW
     */
    const [screenView, setScreenView] = useState<View>({ row: 0, col: 0, cellSize: 10 })
    const [cursor, setCursor] = useState<string>("pointer");
    const isPointerDown = useRef<boolean>(false);
    const isCameraGrabbed = useRef<boolean>(false);
    const lastPointerPosition = useRef<Vector2>(Vector2.ZERO);
    const [map, _] = mapData;
    const cameraControls = useKeyHandler(new BirdsEyeCameraControls(setCamera));
    
    function canvasToWorld(canvasPosition: IVector2): Vector2 {
        return new Vector2(canvasPosition.row / screenView.cellSize - screenView.row, canvasPosition.col / screenView.cellSize - screenView.col)
    }

    function worldToCanvas(worldPosition: IVector2): Vector2 {
        return new Vector2((screenView.row + worldPosition.row) * screenView.cellSize, (screenView.col + worldPosition.col) * screenView.cellSize)
    }

    function focus(worldPosition: IVector2) {
        setScreenView(screenView => { 
            try {
                const [canvas, _] = getCanvasAndContext(canvasRef)
                const worldViewportCenter = new Vector2(canvas.height, canvas.width).scale(1/screenView.cellSize).scale(1/2)
                const viewPosition = subtractVector2(Vector2.fromIVector2(worldPosition).scale(-1), worldViewportCenter.scale(-1))
                return {...screenView, ...viewPosition }
            } catch (error) {
                return {...screenView}
            }
        })
    }

    function center(): void {
        focus(new Vector2(map.tiles.length, map.tiles[0].length).scale(1/2))
    }

    function fit(): void {
        setScreenView(screenView => {
                try {
                    const [canvas, _] = getCanvasAndContext(canvasRef)
                    const dimensions = new Vector2(map.tiles.length, map.tiles[0].length)
                    const viewportSize = new Vector2(canvas.height, canvas.width)
                    const cellSize = Math.min(viewportSize.row / dimensions.row, viewportSize.col / dimensions.col)
                    // setScreenView(screenView => ({...screenView, ...viewPosition}))
                return {...screenView, cellSize: cellSize }
                } catch (error) {
                    return {...screenView}
                }
            })
    }
    
    function pointerPositionInCanvas(event: PointerEvent<Element>): Vector2 {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas !== null && canvas !== undefined) {
            const canvasBounds: DOMRect = canvas.getBoundingClientRect();
            return new Vector2(Math.trunc(event.clientY - canvasBounds.y), Math.trunc(event.clientX - canvasBounds.x))
        }
        return Vector2.ZERO
    }

    function pointerPositionInWorld(event: PointerEvent<Element>): Vector2 {
        return canvasToWorld(pointerPositionInCanvas(event))
    }

    function getHoveredCell(event: PointerEvent<Element>): Vector2 {
        return pointerPositionInWorld(event).int()
        // const positionInCanvas: IVector2 = pointerPositionInCanvas(event);
        // return new Vector2(screenView.row + positionInCanvas.row / screenView.cellSize, screenView.col + positionInCanvas.col / screenView.cellSize)
    }

    function renderMap(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        // context.canvas.width = map.dimensions.col * screenView.cellSize;
        // context.canvas.height = map.dimensions.row * getMapScale();
        for (let row = 0; row < map.dimensions.row; row++) {
            for (let col = 0; col < map.dimensions.col; col++) {
                context.fillStyle = rgbToString(map.tiles[row][col].color);
                const pos = Vector2.fromIVector2(screenView).translate(row, col).scale(screenView.cellSize)
                context.fillRect(pos.col, pos.row, screenView.cellSize, screenView.cellSize);
                // context.fillRect((screenView.col + col) * screenView.cellSize, (screenView.row + row) * screenView.cellSize, screenView.cellSize, screenView.cellSize);
            }
        }

    }

    function renderPointerLine(context: CanvasRenderingContext2D): void {
        if (lastPointerPosition.current.isZero() === false) {
            context.save();
            context.strokeStyle = 'yellow'
            context.setLineDash([1, 1]);
            context.beginPath();
            const cameraPositionOnMap = worldToCanvas(camera.position);
            context.moveTo(cameraPositionOnMap.col, cameraPositionOnMap.row);
            context.lineTo(lastPointerPosition.current.col, lastPointerPosition.current.row);
            context.stroke();
            context.restore();
        }
    }


    function renderCamera(context: CanvasRenderingContext2D): void {
        context.save();
        if (cameraLoaded) {
            const cameraPositionOnMap = worldToCanvas(camera.position)
            context.transform(1, 0, 0, 1, cameraPositionOnMap.col, cameraPositionOnMap.row);
            const offsetDirection = addVector2(vector2ToLength(camera.direction, -cameraImage.height), { row: 0, col: cameraImage.width / 4 });// camera.direction.toLength(-cameraImage.height).add(new IVector2(0, cameraImage.width / 4));
            context.translate(offsetDirection.col, offsetDirection.row);
            context.rotate(-vector2ToAngle(camera.direction) + Math.PI / 2)
            context.drawImage(cameraImage, -cameraImage.width / 2, -cameraImage.height / 2);
        } else {
            context.fillStyle = 'red';
            context.fillRect( (screenView.col + camera.position.col) * screenView.cellSize, (screenView.row + camera.position.row) * screenView.cellSize, screenView.cellSize / 4, screenView.cellSize / 4);
        }
        context.restore();
    }

    function renderRays(context: CanvasRenderingContext2D): void {
        context.save();
        context.beginPath();
        context.strokeStyle = 'green';

        const rays: Ray[] = getCameraRays(camera, 200);
        rays.forEach(ray => {
            const result: RaycastHit | RaycastNoHit = castRay(ray, camera.map, camera.viewDistance);
            const screenRayStart = worldToCanvas(result.originalRay.origin)
            const screenRayEnd = worldToCanvas(result.end)
            context.moveTo(screenRayStart.col, screenRayStart.row);
            context.lineTo(screenRayEnd.col, screenRayEnd.row)
        })

        context.stroke();
        context.restore();
    }

    function renderCameraPlane(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.strokeStyle = 'blue';
        const cameraPlane: LineSegment = getCameraPlane(camera).transform(vec => worldToCanvas(vec));
        context.moveTo(cameraPlane.start.col, cameraPlane.start.row);
        context.lineTo(cameraPlane.end.col, cameraPlane.end.row);
        context.stroke();
        context.restore();
    }

    function render() {
        try {
            const [canvas, context] = getCanvasAndContext(canvasRef)
            context.clearRect(0, 0, canvas.width, canvas.height);
            renderMap(context);
            renderCamera(context);
            renderRays(context);
            renderCameraPlane(context);
            renderPointerLine(context);
        } catch (error) {
            console.error(error)
        }
    }
    

    useEffect(render, [render])
    useEffect( () => {
        console.log(canvasRef.current)
        updateCanvasSize()
        center()
        fit()
    }, [])

    useResizeObserver(canvasHolderRef, updateCanvasSize);

    function updateCanvasSize() {
        try {
            const [canvas, context]: [HTMLCanvasElement, CanvasRenderingContext2D] = getCanvasAndContext(canvasRef);
            const canvasHolder: HTMLDivElement | null = canvasHolderRef.current;
            if (canvasHolder !== null && canvasHolder !== undefined) {
                const rect: DOMRect = canvasHolder.getBoundingClientRect();
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
        } catch (err) {
            console.error(err)
        }

      }

    function faceCameraToPointer(event: PointerEvent<Element>) {
        const cameraPosition = worldToCanvas(camera.position);
        const pointerPosition = pointerPositionInCanvas(event);
        if (!cameraPosition.equals(pointerPosition)) {
            setCamera(camera => ({
                ...camera,
                direction: pointerPosition.subtract(cameraPosition).normalize() 
            }))
        }
    }

    function onPointerMove(event: PointerEvent<Element>) {

        
        if (isPointerDown.current) {
            
            if (event.shiftKey) {
                const WEAKEN_FACTOR = .10;
                const movementVector = new Vector2(event.movementY, event.movementX).scale(WEAKEN_FACTOR);
                const newScreenPosition = addVector2(screenView, movementVector)
                setScreenView(screenView => ({...screenView, ...newScreenPosition}))
            } else if (isCameraGrabbed.current) {
                const worldPointerPosition = pointerPositionInWorld(event);
                if (worldPointerPosition.row >= 0 && worldPointerPosition.col >= 0 && worldPointerPosition.row < map.tiles.length && worldPointerPosition.col < map.tiles[0].length) {
                    setCamera(camera => ( { ...camera, position: worldPointerPosition } ))
                }
            } else {
                faceCameraToPointer(event);
            }

        }

        lastPointerPosition.current = pointerPositionInCanvas(event);
        render();
    }

    function onPointerDown(event: PointerEvent<Element>) {
        isPointerDown.current = true;
        const pointerCanvasPosition = pointerPositionInCanvas(event);

        if (event.shiftKey) {
            const movementVector = new Vector2(event.movementY, event.movementX);
            const newScreenPosition = addVector2(screenView, movementVector)
            setScreenView(screenView => ({...screenView, ...newScreenPosition}))
        } else {

            if (pointerCanvasPosition.distance(worldToCanvas(camera.position)) <= 15) {
                isCameraGrabbed.current = true;
                setCursor('move');
            } else {
                faceCameraToPointer(event);
            }

        }


        lastPointerPosition.current = pointerPositionInCanvas(event);
    }

    function reset() {
        isPointerDown.current = false;
        isCameraGrabbed.current = false;
        lastPointerPosition.current = Vector2.ZERO;

        setCamera( (camera: Camera) => ({...camera, position: tryPlaceCamera(camera, camera.position)}) );
        setCursor('pointer');
    }

    function onPointerUp() { reset(); }
    function onPointerLeave() { reset(); }
    function onPointerCancel() { reset(); }

    function onWheel(event: WheelEvent<Element>) {
        console.log(event.shiftKey, event.deltaY)
        const WHEEL_WEAKEN = 50;
        if (event.shiftKey) {
            const changeInSize = event.deltaY / WHEEL_WEAKEN;
            setScreenView( screenView => ({...screenView, cellSize: Math.min(64, Math.max(2, screenView.cellSize + changeInSize)) } ))
        } else {
            setCamera( camera => ({
                ...camera,
                fieldOfView: camera.fieldOfView + (event.deltaY / WHEEL_WEAKEN * Math.PI / 180.0)
            }) )
        }
    }

    function onKeyDown(event: KeyboardEvent<Element>) {
        cameraControls.current.onKeyDown(event)
        console.log(event.key)
        if (event.key.toLowerCase() === "c") {
            center()
        } else if (event.key.toLowerCase() === "f") {
            fit()
            center()
        }
    }



    return (
    <div className={mapScreenStyles["map-container"]} onKeyDown={onKeyDown} onKeyUp={(event) => cameraControls.current.onKeyUp(event)} tabIndex={0}>
        <div className={mapScreenStyles["map-canvas-holder"]} ref={canvasHolderRef}>
            <canvas style={{cursor: cursor}} className={mapScreenStyles["map-canvas"]} onWheel={onWheel} onPointerCancel={onPointerCancel} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove}  onTouchStart={() => setShowTouchControls(true)} ref={canvasRef}> </canvas>
        </div>

        {showTouchControls && <TouchControls cameraData={cameraData} />}
    </div>
  )
}
