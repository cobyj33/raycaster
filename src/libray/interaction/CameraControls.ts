import { Camera } from "libray/Camera";
import { GameMap } from "libray/GameMap";
import { Vector2 } from "jsutil";
import { KeyBinding, KeyHandler } from "libray/interaction/KeySystem"

const MOVEMENT_CHECKING_DISTANCE = 0.15;

export const canMoveCameraPosition = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): boolean => {
    const nextPosition = currentPosition.add(currentDirection.toLength(distance))
    const checkingOffset = MOVEMENT_CHECKING_DISTANCE * (distance < 0 ? -1 : 1)

    const checkingPosition = nextPosition.add(currentDirection.toLength(checkingOffset))
    const nextMapPosition = checkingPosition.floor()
    if (map.inBoundsVec2(nextMapPosition)) {
        if (map.atVec2(nextMapPosition).canCollide === false) {
            return true
        }
    }
    return false;
}

export const getMovedCameraPosition = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): Vector2 => {
    const movement: Vector2 = currentDirection.toLength(distance)
    const nextPosition = currentPosition.add(movement)

    if (canMoveCameraPosition(currentPosition, currentDirection, distance, map)) {
        return nextPosition;
    } else {
        if (canMoveCameraPosition(currentPosition, movement.rowcomp(), distance, map)) {
            return currentPosition.add(movement.rowcomp());
        } else if (canMoveCameraPosition(currentPosition, movement.colcomp(), distance, map)) {
            return currentPosition.add(movement.colcomp());
        }
    }
    return currentPosition;
}

interface FirstPersonCameraControlsConfig {
    moveSpeed: number,
}

const FIRST_PERSON_CAMERA_CONTROL_DEFAULT_MOVE_SPEED = 0.25;
export class FirstPersonCameraControls extends KeyHandler {
    moveSpeed: number;
    moveFactor: number = 1;
    map: GameMap
    setCamera: React.Dispatch<React.SetStateAction<Camera>>

    get speed() {
        return this.moveSpeed * this.moveFactor
    }

    moveForward() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction, this.speed, this.map)));
    }

    moveBackward() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.scale(-1), this.speed, this.map)));
    }

    moveLeft() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.rotate(Math.PI / 2), this.speed, this.map) ));
    }

    moveRight() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.rotate(-Math.PI / 2), this.speed, this.map) ));
    }

    constructor(map: GameMap, setCamera: React.Dispatch<React.SetStateAction<Camera>>, moveSpeed: number = FIRST_PERSON_CAMERA_CONTROL_DEFAULT_MOVE_SPEED) {
        super()
        this.map = map
        this.setCamera = setCamera
        this.moveSpeed = moveSpeed

        super.setBindings([
            new KeyBinding({ code: 'KeyW', onDown: this.moveForward.bind(this), whileDown: this.moveForward.bind(this) }),
            new KeyBinding({ code: 'ArrowUp', onDown: this.moveForward.bind(this), whileDown: this.moveForward.bind(this) }),
            new KeyBinding({ code: 'KeyA', onDown: this.moveLeft.bind(this), whileDown: this.moveLeft.bind(this)}),
            new KeyBinding({ code: 'ArrowLeft', onDown: this.moveLeft.bind(this), whileDown: this.moveLeft.bind(this)}),
            new KeyBinding({code: 'KeyS', onDown: this.moveBackward.bind(this), whileDown: this.moveBackward.bind(this) }),
            new KeyBinding({code: 'ArrowDown', onDown: this.moveBackward.bind(this), whileDown: this.moveBackward.bind(this) }),
            new KeyBinding({code: 'KeyD', onDown: this.moveRight.bind(this), whileDown: this.moveRight.bind(this) }),
            new KeyBinding({code: 'ArrowRight', onDown: this.moveRight.bind(this), whileDown: this.moveRight.bind(this) }),
            new KeyBinding({code: 'ShiftLeft', onDown: () => this.moveFactor = 2, onUp: () => this.moveFactor = 1})
        ])
    }

}

export class BirdsEyeCameraControls extends KeyHandler {
    moveSpeed: number = 0.25;
    sensitivity: number = 1;
    map: GameMap
    setCamera: React.Dispatch<React.SetStateAction<Camera>>

    moveForward() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction, this.speed, this.map)));

    }

    moveBackward() {
        this.setCamera(camera => camera.place(getMovedCameraPosition(camera.position, camera.direction.scale(-1), this.speed, this.map)));
    }

    turnLeft() {
        this.setCamera(camera => camera.face(camera.direction.rotate(this.rotation)) );
    }

    turnRight() {
        this.setCamera(camera => camera.face(camera.direction.rotate(-this.rotation)) );
    }

    slowDown() {
        this.sensitivity = 0.5;
    }

    get speed() {
        return this.moveSpeed * this.sensitivity
    }

    get rotation() {
        return this.sensitivity * Math.PI / 180
    }
    
    constructor(map: GameMap, setCamera: React.Dispatch<React.SetStateAction<Camera>>) {
        super()
        this.map = map
        this.setCamera = setCamera

        super.setBindings([
            new KeyBinding({ code: 'KeyW', onDown: this.moveForward.bind(this), whileDown: this.moveForward.bind(this) }),
            new KeyBinding({ code: 'ArrowUp', onDown: this.moveForward.bind(this), whileDown: this.moveForward.bind(this) }),
            new KeyBinding({ code: 'KeyA', onDown: this.turnLeft.bind(this), whileDown: this.turnLeft.bind(this) }),
            new KeyBinding({ code: 'ArrowLeft', onDown: this.turnLeft.bind(this), whileDown: this.turnLeft.bind(this) }),
            new KeyBinding( {code: 'KeyS', onDown: this.moveBackward.bind(this), whileDown: this.moveBackward.bind(this) }),
            new KeyBinding( {code: 'ArrowDown', onDown: this.moveBackward.bind(this), whileDown: this.moveBackward.bind(this) }),
            new KeyBinding( {code: 'KeyD', onDown: this.turnRight.bind(this), whileDown: this.turnRight.bind(this) }),
            new KeyBinding( {code: 'ArrowRight', onDown: this.turnRight.bind(this), whileDown: this.turnRight.bind(this) }),
            new KeyBinding( {code: 'ShiftLeft', onDown: () => this.sensitivity = 2, onUp: () => this.sensitivity = 1}),
            new KeyBinding( { code: "KeyQ", onDown: this.slowDown.bind(this), onUp: () => this.sensitivity = 1})
        ])
    }
}
