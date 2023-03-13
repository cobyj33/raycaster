import React, { MutableRefObject, RefObject, PointerEvent, useEffect, useRef, useState, WheelEvent } from 'react'
import { useKeyHandler } from "libray/interaction/KeySystem";
import { PointerLockEvents } from 'libray/interaction/PointerLockEvents';
import { FirstPersonCameraControls } from 'libray/interaction/CameraControls';
import { MapScreen } from 'components/screens/MapScreen';
import { TouchControls } from 'components/TouchControls';

import { StatefulData, useCanvasHolderUpdater, withCanvasAndContextWebGL2 } from 'jsutil/react';
import { clamp } from "jsutil/common"
import { Camera, renderCamera, tryPlaceCamera } from 'libray/Camera';
import { GameMap } from 'libray/GameMap';

import gameScreenStyles from "components/styles/GameScreen.module.css"

const Y_MOVEMENT_TOLERANCE = 500;

interface GameScreenState {
    mobile: boolean,
    showTouchControls: boolean,
    showMap: boolean
}

const INITIAL_GAME_SCREEN_STATE: GameScreenState = {
    mobile: false,
    showTouchControls: false,
    showMap: false
}

type GameScreenStateToggleMapAction = { type: "toggle map" }
type GameScreenStateMobileAction = { type: "mobile" }
type GameScreenStateActions = GameScreenStateToggleMapAction | GameScreenStateMobileAction

type GameScreenStateReducer = React.Reducer<GameScreenState, GameScreenStateActions>
const gameScreenReducer: GameScreenStateReducer = (state, action) => {
    const { type } = action
    switch (type) {
        case "toggle map": return {...state, showMap: !state.showMap}
        case "mobile": return {...state, showTouchControls: true, mobile: true }
    }
}

export const GameScreen = ( { mapData, cameraData, moveSpeed = 0.25  }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera>, moveSpeed?: number }  ) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const canvasHolderRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    const [camera, setCamera] = cameraData;
    const [gameMap, setGameMap] = mapData;
    const [screenState, screenStateDispatch] = React.useReducer<GameScreenStateReducer>(gameScreenReducer, INITIAL_GAME_SCREEN_STATE)
    const { showTouchControls, showMap } = screenState
    // const [map, setMap] = mapData;

    const cameraControls = React.useRef<FirstPersonCameraControls>(new FirstPersonCameraControls(gameMap, setCamera, moveSpeed))
    const keyHandlerRef = useKeyHandler(cameraControls.current);
    React.useEffect( () => {
        cameraControls.current.map = gameMap
    }, [mapData])

    const mouseControls = useRef<(event: Event | PointerEvent<Element>) => void>((event: Event | PointerEvent<Element>) => {
        if ("movementX" in event && "movementY" in event && typeof(event.movementX) === "number" && typeof(event.movementY) === "number") {
            const xMovement = -event.movementX;
            // const yMovement = -Math.sin(event.movementY / 10 * (Math.PI / 180.0));
            const yMovement = -Math.atan2(event.movementY, Y_MOVEMENT_TOLERANCE);
            setCamera( (camera: Camera) => {
                const MAX_LOOKING_ANGLE = Math.PI / 4
                const MIN_LOOKING_ANGLE = -Math.PI / 4
                const TURN_DAMPENING_FACTOR = 1 / 40;
    
                const newLookingAngle =  clamp(camera.lookingAngle + yMovement, MIN_LOOKING_ANGLE, MAX_LOOKING_ANGLE) 
                const cameraRotation = xMovement * TURN_DAMPENING_FACTOR * (Math.PI / 180.0)
                return camera.face(camera.direction.rotate(cameraRotation)).withLookingAngle(newLookingAngle)
            });
        } else {
            throw new Error(`Received a non-movement event in mouseControls for GameScreen`)
        }
    });

    const cameraRenderProgram = React.useRef<WebGLProgram | null>(null)

    function render() {
        withCanvasAndContextWebGL2(canvasRef, ({ gl, canvas}) => {
            cameraRenderProgram.current = renderCamera(camera, gameMap, canvas, gl, cameraRenderProgram.current);
        })
    }

    useEffect(render, [camera]);
    const pointerLockEvents: MutableRefObject<PointerLockEvents | null> = useRef<PointerLockEvents | null>(null);

    useEffect( () => {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            pointerLockEvents.current = new PointerLockEvents( [ ['mousemove', mouseControls.current] ], canvasRef.current )
        }
        setCamera(camera => camera.place(tryPlaceCamera(camera, gameMap, camera.position))) // Resolve any starting collisions with walls

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
        const WHEEL_DAMPENING_FACTOR = 1 / 50;
        const changeInFOV = event.deltaY * WHEEL_DAMPENING_FACTOR * Math.PI / 180.0
        setCamera( camera => camera.withFOV(camera.fieldOfView + changeInFOV) )
    }

    

    useCanvasHolderUpdater(canvasRef, canvasHolderRef, render)

    function onKeyDown(event: React.KeyboardEvent<Element>) {
        keyHandlerRef.current.onKeyDown(event)
        
        if (event.code === "KeyM") {
            screenStateDispatch({ type: "toggle map" })
        }
    }

    function onKeyUp(event: React.KeyboardEvent<Element>) {
        keyHandlerRef.current.onKeyUp(event)
    }


  return (
    <div ref={containerRef} className={gameScreenStyles["game-screen-container"]} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}>

        <div className={gameScreenStyles["game-canvas-holder"]} ref={canvasHolderRef}>
            <canvas className={gameScreenStyles["game-canvas"]} onWheel={onWheel} onTouchStart={() => screenStateDispatch({ type: "mobile" })} onPointerDown={runPointerLockOnMouse} onPointerMove={mouseControls.current} ref={canvasRef} tabIndex={0}> </canvas>
        </div>
        
        {showTouchControls && <TouchControls cameraData={cameraData} mapData={mapData}/>}


        <div className={gameScreenStyles["internal-map"]}>
            { showMap && <MapScreen cameraData={cameraData} mapData={mapData} />}
        </div>
    </div>
  )
}

export default GameScreen