import { Camera, scaleVector2, rotateVector2, StatefulData } from "raycaster/interfaces"
import { getMovedCameraPosition } from "raycaster/controls"
import { HoldButton } from "raycaster/components";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import touchControlStyles from "components/styles/TouchControls.module.css"

export const TouchControls = ({ cameraData }: { cameraData: StatefulData<Camera> }) => {
    const [camera, setCamera] = cameraData;

    const moveForward = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, camera.direction, camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveBackward = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, scaleVector2(camera.direction, -1), camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveLeft = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, Math.PI / 2), camera.moveAmount * camera.sensitivity, camera.map)}))
    const moveRight = () => setCamera( (camera) => ({ ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, -Math.PI / 2), camera.moveAmount * camera.sensitivity, camera.map)}))
    const turnLeft = () => setCamera((camera) => ({...camera, direction: rotateVector2(camera.direction, -camera.sensitivity * Math.PI / 180)}))
    const turnRight = () => setCamera((camera) => ({...camera, direction: rotateVector2(camera.direction, -camera.sensitivity * -Math.PI / 180)}))

  return (
    <div className={touchControlStyles["touch-controls"]}> 
        <div className={touchControlStyles["movement-touch-controls"]}>
            <HoldButton className={`${touchControlStyles["forward-touch-button"]} ${touchControlStyles["touch-button"]}`} onDown={moveForward} whileDown={moveForward}> <FaArrowUp /> </HoldButton>
            <HoldButton className={`${touchControlStyles["left-touch-button"]} ${touchControlStyles["touch-button"]}`} onDown={moveLeft} whileDown={moveLeft}> <FaArrowLeft /> </HoldButton>
            <HoldButton className={`${touchControlStyles["backward-touch-button"]} ${touchControlStyles["touch-button"]}`} onDown={moveBackward} whileDown={moveBackward}> <FaArrowDown /> </HoldButton>
            <HoldButton className={`${touchControlStyles["right-touch-button"]} ${touchControlStyles["touch-button"]}`} onDown={moveRight} whileDown={moveRight}> <FaArrowRight /> </HoldButton>
        </div>
        <div className={touchControlStyles["orientation-touch-controls"]}>
            <HoldButton className={`${touchControlStyles["touch-button"]} ${touchControlStyles["orientation-touch-button"]}`} onDown={turnLeft} whileDown={turnLeft}> <FaRegArrowAltCircleLeft /> </HoldButton>
            <HoldButton className={`${touchControlStyles["touch-button"]} ${touchControlStyles["orientation-touch-button"]}`} onDown={turnRight} whileDown={turnRight}> <FaRegArrowAltCircleRight /> </HoldButton>
        </div>
    </div>
  )

}
