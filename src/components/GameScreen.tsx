import React, { KeyboardEvent, KeyboardEventHandler, MutableRefObject, MouseEvent, RefObject, PointerEvent, TouchEvent, useEffect, useRef, useState } from 'react'
import { start } from 'repl';
import { Angle } from '../classes/Data/Angle';
import { Camera } from '../classes/Camera'
import {  FirstPersonCameraControls } from '../classes/CameraControls';
import { GameMap } from '../classes/GameMap';
import { KeyBinding } from '../classes/KeySystem/KeyBinding';
import { KeyHandler, useKeyHandler } from '../classes/KeySystem/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'
import "./gamescreen.css"
import { collapseTextChangeRangesAcrossMultipleVersions, createLanguageServiceSourceFile } from 'typescript';
import { PointerLockEvents } from '../classes/PointerLockEvents';
import { Vector2 } from '../classes/Data/Vector2';
import { useResizeObserver } from '../functions/useResizeObserver';
import { HoldButton } from './HoldButton';
import { move } from '../classes/CameraControls';
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';


export const GameScreen = ( { cameraData, mapData  }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap> }  ) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [camera, setCamera] = cameraData;
    const [map, setMap] = mapData;

    const keyHandlerRef = useKeyHandler(new FirstPersonCameraControls(setCamera));
    const mouseControls = useRef<(event: PointerEvent<Element>) => void>((event: PointerEvent<Element>) => {
        console.log("mouse controlling");
        const xMovement = -event.movementX;
        setCamera( (camera) => camera.setDirection(camera.direction.rotate( Angle.fromDegrees( xMovement / 40 ) )) );
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

    const moveForward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction, camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveBackward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.scale(-1), camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveLeft = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveRight = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(-90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-camera.sensitivity))));
    const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(camera.sensitivity))));

  return (
    <div   ref={containerRef} className="container" onKeyDown={(event) => keyHandlerRef.current.onKeyDown(event)} onKeyUp={(event) => keyHandlerRef.current.onKeyUp(event)} tabIndex={0}>
        <canvas onMouseDown={bindPointerLock} onPointerMove={mouseControls.current} className="game-canvas" ref={canvasRef} style={{backgroundColor: 'black'}} tabIndex={0}> </canvas>
        {/* <p> {camera.toString()} </p>  */}
        {/* { document.pointerLockElement === canvasRef.current ? <button className='free-pointer-button' onClick={() => pointerLockEvents.current?.dispose()}> Free Pointer </button> : '' } */}

        <div className="game-touch-controls"> 
            <div className="game-movement-touch-controls">
                <HoldButton className='game-w-button game-touch-button game-movement-touch-button' onDown={moveForward} whileDown={moveForward}> <FaArrowUp /> </HoldButton>
                <HoldButton className='game-a-button game-touch-button game-movement-touch-button' onDown={moveLeft} whileDown={moveLeft}> <FaArrowLeft /> </HoldButton>
                <HoldButton className='game-s-button game-touch-button game-movement-touch-button' onDown={moveBackward} whileDown={moveBackward}> <FaArrowDown /> </HoldButton>
                <HoldButton className='game-d-button game-touch-button game-movement-touch-button' onDown={moveRight} whileDown={moveRight}> <FaArrowRight /> </HoldButton>
            </div>
            <div className="game-orientation-controls">
                <HoldButton className='game-turn-left-button game-touch-button game-orientation-touch-button' onDown={turnLeft} whileDown={turnLeft}> <FaRegArrowAltCircleLeft /> </HoldButton>
                <HoldButton className='game-turn-right-button game-touch-button game-orientation-touch-button' onDown={turnRight} whileDown={turnRight}> <FaRegArrowAltCircleRight /> </HoldButton>
            </div>
        </div>


    </div>
  )
}
