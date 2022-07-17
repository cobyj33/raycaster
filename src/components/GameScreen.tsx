import React, { KeyboardEvent, KeyboardEventHandler, MutableRefObject, RefObject, useEffect, useRef } from 'react'
import { start } from 'repl';
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera'
import {  FirstPersonCameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { KeyBinding } from '../classes/KeyBinding';
import { KeyHandler, useKeyHandler } from '../classes/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./gamescreen.css"
import { collapseTextChangeRangesAcrossMultipleVersions, createLanguageServiceSourceFile } from 'typescript';
import { PointerLockEvents } from '../classes/PointerLockEvents';


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
            gameCanvas.current.width = gameCanvas.current.clientWidth;
            gameCanvas.current.height = gameCanvas.current.clientHeight;
            cameraData[0].render(gameCanvas.current);
        }
    }

    useEffect(render, [camera]);
    
    const pointerLockEvents: MutableRefObject<PointerLockEvents | null> = useRef<PointerLockEvents | null>(null);
    useEffect( () => {
        if (containerRef.current !== null && containerRef.current !== undefined) {
            pointerLockEvents.current = new PointerLockEvents( [ ['mousemove', mouseControls.current] ], containerRef.current )
        }

        return () => {
            if (pointerLockEvents.current !== null && pointerLockEvents.current !== undefined) {
                pointerLockEvents.current.dispose();
            }
        }
    }, [])



  return (
    <div  onPointerDown={() => {
        if (pointerLockEvents.current !== null && pointerLockEvents.current !== undefined) {
            pointerLockEvents.current.bind();
        }
    }} ref={containerRef} className="container" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas className="game-canvas" ref={gameCanvas} style={{backgroundColor: 'black'}} tabIndex={0}> </canvas>
        {/* <p> {camera.toString()} </p>  */}
    </div>
  )
}
