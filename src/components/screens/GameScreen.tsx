import React, { MutableRefObject, RefObject, PointerEvent, useEffect, useRef, useState, WheelEvent } from 'react'
import { useKeyHandler } from "raycaster/keysystem";
import { PointerLockEvents, FirstPersonCameraControls } from "raycaster/controls";
import { MapScreen, TouchControls } from "raycaster/components"
import { StatefulData, Camera, renderCamera, rotateVector2, tryPlaceCamera, GameMap } from "raycaster/interfaces";
import gameScreenStyles from "components/styles/GameScreen.module.css"
import { clamp } from 'functions/util';
import { useCanvasHolderUpdater } from 'functions/hooks';

const Y_MOVEMENT_TOLERANCE = 500;

export const GameScreen = ( { mapData, cameraData, moveSpeed = 0.25  }: { mapData: StatefulData<GameMap>, cameraData: StatefulData<Camera>, moveSpeed?: number }  ) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const canvasHolderRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    const [camera, setCamera] = cameraData;
    const [gameMap, setGameMap] = mapData;
    const [showTouchControls, setShowTouchControls] = useState<boolean>(false);
    // const [map, setMap] = mapData;

    const cameraControls = React.useRef<FirstPersonCameraControls>(new FirstPersonCameraControls(gameMap, setCamera, moveSpeed))
    const keyHandlerRef = useKeyHandler(cameraControls.current);
    React.useEffect( () => {
        cameraControls.current.map = gameMap
    }, [mapData])

    const mouseControls = useRef<(event: PointerEvent<Element>) => void>((event: PointerEvent<Element>) => {
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
    });

    const cameraRenderProgram = React.useRef<WebGLProgram | null>(null)

    function render() {
        const canvas = canvasRef.current
        const canvasHolder = canvasHolderRef.current
        if (canvas !== null && canvas !== undefined && canvasHolder !== null && canvasHolder !== undefined) {
            const rect: DOMRect = canvasHolder.getBoundingClientRect()
            canvas.width = rect.width;
            canvas.height = rect.height;
            const gl = canvas.getContext("webgl2");
            if (gl !== null && gl !== undefined) {
                cameraRenderProgram.current = renderCamera(camera, gameMap, canvas, gl, cameraRenderProgram.current);
            }
        }
    }

    useEffect(render, [camera]);
    
    const pointerLockEvents: MutableRefObject<PointerLockEvents | null> = useRef<PointerLockEvents | null>(null);

    useEffect( () => {
        if (canvasRef.current !== null && canvasRef.current !== undefined) {
            pointerLockEvents.current = new PointerLockEvents( [ ['mousemove', mouseControls.current] ], canvasRef.current )
        }
        setCamera(camera => camera) // Resolve any starting collisions with walls

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

    const [showMap, setShowMap] = useState<boolean>(false)

    function onKeyDown(event: React.KeyboardEvent<Element>) {
        keyHandlerRef.current.onKeyDown(event)
        
        if (event.code === "KeyM") {
            setShowMap(!showMap)
        }
    }

    function onKeyUp(event: React.KeyboardEvent<Element>) {
        keyHandlerRef.current.onKeyUp(event)
    }


  return (
    <div ref={containerRef} className={gameScreenStyles["game-screen-container"]} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}>

        <div className={gameScreenStyles["game-canvas-holder"]} ref={canvasHolderRef}>
            <canvas className={gameScreenStyles["game-canvas"]} onWheel={onWheel} onTouchStart={() => setShowTouchControls(true)} onPointerDown={runPointerLockOnMouse} onPointerMove={mouseControls.current} ref={canvasRef} tabIndex={0}> </canvas>
        </div>
        
        {showTouchControls && <TouchControls cameraData={cameraData} mapData={mapData}/>}


        <div className={gameScreenStyles["internal-map"]}>
            { showMap && <MapScreen cameraData={cameraData} mapData={mapData} />}
        </div>
    </div>
  )
}
