import { MutableRefObject, RefObject, PointerEvent, useEffect, useRef, useState, WheelEvent } from 'react'
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera'
import {  FirstPersonCameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { useKeyHandler } from '../classes/KeySystem/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./styles/gamescreen.scss"
import { PointerLockEvents } from '../classes/PointerLockEvents';
import { TouchControls } from './TouchControls';


export const GameScreen = ( { cameraData, mapData  }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap> }  ) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [camera, setCamera] = cameraData;
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    const [map, setMap] = mapData;

    const keyHandlerRef = useKeyHandler(new FirstPersonCameraControls(setCamera));
    const mouseControls = useRef<(event: PointerEvent<Element>) => void>((event: PointerEvent<Element>) => {
        const xMovement = -event.movementX;
        const yMovement = Angle.fromRadians(-Math.sin(event.movementY / 10 * Angle.DEGREESTORADIANS));
        const newLookingAngle = (camera: Camera) => Angle.fromRadians( Math.max( -Math.PI / 6, Math.min( Math.PI / 6, camera.lookingAngle.add(yMovement).radians ) ) )
        setCamera( (camera) => camera.setDirection(camera.direction.rotate( Angle.fromDegrees( xMovement / 40 ) )) );
        setCamera( (camera) => camera.setLookingAngle(  newLookingAngle(camera) ) );
    });

    function render() {
        if (canvasRef.current != null) {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.clientHeight;
            cameraData[0].render(canvasRef.current);
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

    function updateCanvasSize() {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
          const canvas: HTMLCanvasElement = canvasRef.current;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
      }

    // useResizeObserver( updateCanvasSize )

    function runPointerLockOnMouse(event: PointerEvent<Element>) {
        if (event.pointerType === 'mouse') {
            bindPointerLock()
        }
    }

    function onWheel(event: WheelEvent<Element>) {
        console.log(event.deltaY);
        setCamera(camera => camera.setFOV(camera.fieldOfView.add( Angle.fromDegrees(event.deltaY / 50))));
    }

    const [showFOVIndicator, setShowFOVIndicator] = useState<boolean>(false);
    const lastCameraFOV = useRef<Angle>(camera.fieldOfView);
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
    <div   ref={containerRef} className="container screen" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas onWheel={onWheel} onTouchStart={() => setShowTouchControls(true)} onPointerDown={runPointerLockOnMouse} onPointerMove={mouseControls.current} className="game-canvas" ref={canvasRef} tabIndex={0}> </canvas>
        
        {showTouchControls && <TouchControls cameraData={cameraData} />}

        <div className="camera-indicators">
            { showFOVIndicator && <span className="camera-indicator"> {`FOV: ${camera.fieldOfView.degrees.toPrecision(3)}`} </span> }
        </div>
    </div>
  )
}
