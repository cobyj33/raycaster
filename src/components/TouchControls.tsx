import React from 'react'
import { Camera } from '../classes/Camera'
import { move } from '../classes/CameraControls'
import { Angle } from '../classes/Data/Angle'
import { StatefulData } from '../interfaces/StatefulData'
import { HoldButton } from './HoldButton'
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import "./touchcontrols.css"

export const TouchControls = ({ cameraData }: { cameraData: StatefulData<Camera> }) => {
    const [camera, setCamera] = cameraData;

    const moveForward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction, camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveBackward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.scale(-1), camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveLeft = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    const moveRight = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(-90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-camera.sensitivity))));
    const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(camera.sensitivity))));

  return (
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
  )

}
