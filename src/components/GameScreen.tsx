import React, { KeyboardEvent, KeyboardEventHandler, RefObject, useEffect, useRef } from 'react'
import { start } from 'repl';
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera'
import {  FirstPersonCameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { KeyBinding } from '../classes/KeyBinding';
import { KeyHandler, useKeyHandler } from '../classes/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./gamescreen.css"

export const GameScreen = ( { cameraData, mapData  }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap> }  ) => {
    const gameCanvas: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [camera, setCamera] = cameraData;
    const [map, setMap] = mapData;
    const keyHandlerRef = useKeyHandler(new FirstPersonCameraControls(setCamera));
    const mouseControls = useRef<(event: MouseEvent) => void>((event: MouseEvent) => {
        console.log("mouse controlling");
        const xMovement = -event.movementX;
        setCamera( (camera) => camera.setDirection(camera.direction.rotate( Angle.fromDegrees( xMovement / 40 ) )) );
    });

    function render() {
        if (gameCanvas.current != null) {
            cameraData[0].render(gameCanvas.current);
        }
    }

    useEffect(render, [camera]);

    const startPointerLock = () => {
        document.removeEventListener('pointerlockchange', startPointerLock);
        const container: HTMLDivElement | null = containerRef.current;
        console.log(container);
        if (container !== null && container !== undefined) {
            container.requestPointerLock();
            document.addEventListener('mousemove', mouseControls.current, true);
        }  
    }

    const endPointerLock = () => {
        document.exitPointerLock();
        document.removeEventListener('mousemove', mouseControls.current, false);
    }

    useEffect( () => {
        return endPointerLock;
    }, [])



  return (
    <div  onPointerDown={() => {
        if (document.pointerLockElement !== null && document.pointerLockElement !== undefined) {
            endPointerLock();
            document.addEventListener('pointerlockchange', startPointerLock);
        } else {
            startPointerLock();
        }
    }} ref={containerRef} className="container" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas ref={gameCanvas} width={window.innerWidth} height={window.innerHeight} style={{backgroundColor: 'black'}} tabIndex={0}> </canvas>
        {/* <p> {camera.toString()} </p>  */}
    </div>
  )
}
