import { MutableRefObject, RefObject, PointerEvent, useEffect, useRef, useState } from 'react'
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera'
import {  FirstPersonCameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { useKeyHandler } from '../classes/KeySystem/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./gamescreen.css"
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
        console.log("mouse controlling");
        const xMovement = -event.movementX;
        const yMovement = Angle.fromRadians(-Math.sin(event.movementY / 10 * Angle.DEGREESTORADIANS));
        setCamera( (camera) => camera.setDirection(camera.direction.rotate( Angle.fromDegrees( xMovement / 40 ) )) );
        setCamera( (camera) => camera.setLookingAngle( Angle.fromRadians( camera.lookingAngle.radians + yMovement.radians )  ) );
    });

    function render() {
        if (canvasRef.current != null) {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.clientHeight;
            // canvasRef.current.width = 16 * 50;
            // canvasRef.current.height = 9 * 50;
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

  return (
    <div   ref={containerRef} className="container" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas onTouchStart={() => setShowTouchControls(true)} onPointerDown={runPointerLockOnMouse} onPointerMove={mouseControls.current} className="game-canvas" ref={canvasRef} tabIndex={0}> </canvas>
        
        {showTouchControls && <TouchControls cameraData={cameraData} />}
    </div>
  )
}
