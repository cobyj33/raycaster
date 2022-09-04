import { MutableRefObject, RefObject, PointerEvent, useEffect, useRef, useState, WheelEvent } from 'react'
import { useKeyHandler } from "raycaster/keysystem";
import { PointerLockEvents, FirstPersonCameraControls } from "raycaster/controls";
import { TouchControls } from "raycaster/components"
import { StatefulData, Camera, renderCamera, rotateVector2 } from "raycaster/interfaces";
import "./styles/gamescreen.scss"


const Y_MOVEMENT_TOLERANCE = 500;

export const GameScreen = ( { cameraData  }: { cameraData: StatefulData<Camera> }  ) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const canvasHolderRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [camera, setCamera] = cameraData;
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    // const [map, setMap] = mapData;

    const keyHandlerRef = useKeyHandler(new FirstPersonCameraControls(setCamera));
    const mouseControls = useRef<(event: PointerEvent<Element>) => void>((event: PointerEvent<Element>) => {
        const xMovement = -event.movementX;
        // const yMovement = -Math.sin(event.movementY / 10 * (Math.PI / 180.0));
        const yMovement = -Math.atan2(event.movementY, Y_MOVEMENT_TOLERANCE);
        setCamera( (camera: Camera) => {
            const newLookingAngle =  Math.max( -Math.PI / 4, Math.min( Math.PI / 4, camera.lookingAngle + yMovement ) ) 
            return ({...camera, direction: rotateVector2(camera.direction,  xMovement / 40 * (Math.PI / 180.0) ), lookingAngle: newLookingAngle });
        });
    });

    function render() {
        if (canvasRef.current != null) {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.clientHeight;
            renderCamera(camera, canvasRef.current);
        }
    }

    useEffect(render, [camera]);
    
    const pointerLockEvents: MutableRefObject<PointerLockEvents | null> = useRef<PointerLockEvents | null>(null);

    useEffect( () => {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            pointerLockEvents.current = new PointerLockEvents( [ ['mousemove', mouseControls.current] ], canvasRef.current )
        }

        return () => {
            if (pointerLockEvents.current !== null && pointerLockEvents.current !== undefined) {
                pointerLockEvents.current.dispose();
            }
        }
    }, [])

    function bindPointerLock() {
        if (pointerLockEvents.current !== null && pointerLockEvents.current !== undefined) {
            pointerLockEvents.current.bind();
        }
    }


    function runPointerLockOnMouse(event: PointerEvent<Element>) {
        if (event.pointerType === 'mouse') {
            bindPointerLock()
        }
    }

    function onWheel(event: WheelEvent<Element>) {
        setCamera( camera => ({
            ...camera,
            fieldOfView: camera.fieldOfView + (event.deltaY / 50 * Math.PI / 180.0)
        }) )
    }

    const [showFOVIndicator, setShowFOVIndicator] = useState<boolean>(false);
    const lastCameraFOV = useRef<number>(camera.fieldOfView);
    const lastFOVShowTime = useRef<number>(0);
    const timetoShowFOVIndicator = 3000;
    useEffect(() => {
        if (lastCameraFOV.current !== camera.fieldOfView) {
            setShowFOVIndicator(true);
            lastFOVShowTime.current = Date.now();
            lastCameraFOV.current = camera.fieldOfView;
            setTimeout(() => {
                if (Date.now() - lastFOVShowTime.current >= timetoShowFOVIndicator) {
                    setShowFOVIndicator(false);
                }
            }, timetoShowFOVIndicator);
        }
    }, [camera])


  return (
    <div ref={containerRef} className="game-container screen" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>

        <div className="game-canvas-holder" ref={canvasHolderRef}>
            <canvas onWheel={onWheel} onTouchStart={() => setShowTouchControls(true)} onPointerDown={runPointerLockOnMouse} onPointerMove={mouseControls.current} className="game-canvas" ref={canvasRef} tabIndex={0}> </canvas>
        </div>
        
        {showTouchControls && <TouchControls cameraData={cameraData} />}

      {
        /*
        
        <div className="camera-indicators">
            { showFOVIndicator && <span className="camera-indicator"> {`FOV: ${(camera.fieldOfView * 180.0/Math.PI).toPrecision(3)}`} </span> }
        </div>


        */

      }
    </div>
  )
}
