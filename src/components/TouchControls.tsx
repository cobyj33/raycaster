import { Camera, scaleVector2, rotateVector2, StatefulData } from "raycaster/interfaces"
import { getMovedCameraPosition } from "raycaster/controls"
import { HoldButton } from "raycaster/components";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import "./styles/touchcontrols.css"

export const TouchControls = ({ cameraData }: { cameraData: StatefulData<Camera> }) => {
    const [camera, setCamera] = cameraData;

    const moveForward = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, camera.direction, camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveBackward = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, scaleVector2(camera.direction, -1), camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveLeft = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, Math.PI / 2), camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveRight = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, -Math.PI / 2), camera.moveAmount * camera.sensitivity, camera.map)}))
    // const moveBackward = () => setCamera( (camera) => camera.setPosition( getMovedCameraPosition(camera.position, camera.direction.scale(-1), camera.moveAmount * camera.sensitivity, camera.map) ))
    // const moveLeft = () => setCamera( (camera) => camera.setPosition( getMovedCameraPosition(camera.position, camera.direction.rotate(Angle.fromDegrees(90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    // const moveRight = () => setCamera( (camera) => camera.setPosition( getMovedCameraPosition(camera.position, camera.direction.rotate(Angle.fromDegrees(-90)), camera.moveAmount * camera.sensitivity, camera.map) ))
    //
    // const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(camera.sensitivity))));
    const turnLeft = () => setCamera((camera) => ({...camera, direction: rotateVector2(camera.direction, -camera.sensitivity * Math.PI / 180)}))
    // const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-camera.sensitivity))));
    const turnRight = () => setCamera((camera) => ({...camera, direction: rotateVector2(camera.direction, -camera.sensitivity * -Math.PI / 180)}))

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
