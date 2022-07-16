import React, { KeyboardEvent, KeyboardEventHandler, RefObject, useEffect, useRef } from 'react'
import { Angle } from '../classes/Angle';
import { Camera } from '../classes/Camera'
import { CameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { KeyBinding } from '../classes/KeyBinding';
import { KeyHandler, useKeyHandler } from '../classes/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./gamescreen.css"

export const GameScreen = ( { cameraData, mapData  }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap> }  ) => {
    const gameCanvas: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = cameraData;
    const [map, setMap] = mapData;
    const keyHandlerRef = useKeyHandler(new CameraControls(setCamera));

    function render() {
        if (gameCanvas.current != null) {
            cameraData[0].render(gameCanvas.current);
        }
    }

    useEffect(render, [camera]);

  return (
    <div className="container" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas ref={gameCanvas} width={window.innerWidth} height={window.innerHeight} style={{backgroundColor: 'black'}}> </canvas>
        {/* <p> {camera.toString()} </p>  */}
    </div>
  )
}
