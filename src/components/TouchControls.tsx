import { Camera } from "interfaces/Camera";
import { StatefulData } from "jsutil/react";
import { GameMap } from "interfaces/GameMap";
import { scaleVector2, rotateVector2 } from "jsutil";
import { getMovedCameraPosition } from "classes/CameraControls";
import { HoldButton } from "components/HoldButton";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import touchControlStyles from "components/styles/TouchControls.module.css"

const MOVE_AMOUNT = 0.25
const SENSITIVITY = 1;
export const TouchControls = ({ cameraData, mapData }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap> }) => {
    const setCamera = cameraData[1];
    const map = mapData[0];
    const speed = MOVE_AMOUNT * SENSITIVITY
    const turningPower = SENSITIVITY * Math.PI / 180

    const moveForward = () => setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction, speed, map)))
    const moveBackward = () => setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.scale(-1), speed, map)))
    const moveLeft = () => setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.rotate(Math.PI / 2), speed, map)))
    const moveRight = () => setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.rotate(-Math.PI / 2), speed, map)))
    const turnLeft = () => setCamera(camera => camera.face(camera.direction.rotate(turningPower)))
    const turnRight = () => setCamera(camera => camera.face(camera.direction.rotate(-turningPower)))

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
