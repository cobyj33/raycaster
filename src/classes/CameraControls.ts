import { Camera, GameMap, IVector2, addVector2, vector2ToLength, gameMapInBounds, rotateVector2, scaleVector2 } from "raycaster/interfaces"
import { KeyBinding, KeyHandler } from "raycaster/keysystem"

const MOVEMENT_CHECKING_DISTANCE = 0.05;

export const canMoveCameraPosition = (currentPosition: IVector2, currentDirection: IVector2, distance: number, map: GameMap): boolean => {
    // const nextPosition = currentPosition.add(currentDirection.toLength(distance));
    const nextPosition = addVector2(currentPosition, vector2ToLength(currentDirection, distance))
    // const checkingPosition = nextPosition.add(currentDirection.toLength(MOVEMENT_CHECKING_DISTANCE * ( distance < 0 ? -1 : 1 )));
    const checkingPosition = addVector2(nextPosition, vector2ToLength(currentDirection, MOVEMENT_CHECKING_DISTANCE * (distance < 0 ? -1 : 1)));
    const nextRowOnMap = Math.floor(checkingPosition.row);
    const nextColOnMap = Math.floor(checkingPosition.col);
    if (gameMapInBounds(map, nextRowOnMap, nextColOnMap)) {
        if (map.tiles[nextRowOnMap][nextColOnMap].canCollide === false) {
            return true
        }
    }
    return false;
}

export const getMovedCameraPosition = (currentPosition: IVector2, currentDirection: IVector2, distance: number, map: GameMap): IVector2 => {
    // const nextPosition = currentPosition.add(currentDirection.toLength(distance));
    const nextPosition = addVector2(currentPosition, vector2ToLength(currentDirection, distance))
    if (canMoveCameraPosition(currentPosition, currentDirection, distance, map)) {
        return nextPosition;
    } else {
        // const rowDirection: IVector2 = currentDirection.toLength(distance).getRowComponent();
        const rowDirection: IVector2 = { row: vector2ToLength(currentDirection, distance).row, col: 0 };
        // const colDirection: IVector2 = currentDirection.toLength(distance).getColComponent();
        const colDirection: IVector2 = { row: 0, col: vector2ToLength(currentDirection, distance).col } ;
        if (canMoveCameraPosition(currentPosition, rowDirection, distance, map)) {
            return addVector2(currentPosition, rowDirection);
        } else if (canMoveCameraPosition(currentPosition, colDirection, distance, map)) {
            return addVector2(currentPosition, colDirection);
        }
    }
    return currentPosition;
}

export class FirstPersonCameraControls extends KeyHandler {
    moveSpeed: number = 0.25;
    moveFactor: number = 1;
    
    constructor(setCamera: React.Dispatch<React.SetStateAction<Camera>>) {


        const moveForward = () => setCamera( (camera) => {
            return { ...camera, position: getMovedCameraPosition(camera.position, camera.direction, this.moveSpeed * this.moveFactor, camera.map) };
        })

        const moveBackward = () => setCamera( (camera) => {
            return { ...camera, position: getMovedCameraPosition(camera.position, scaleVector2(camera.direction, -1), this.moveSpeed * this.moveFactor, camera.map) };
        })

        const moveLeft = () => setCamera( (camera) => {
            return { ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, Math.PI / 2), this.moveSpeed * this.moveFactor, camera.map) };
        })

        const moveRight = () => setCamera( (camera) => {
            return { ...camera, position: getMovedCameraPosition(camera.position, rotateVector2(camera.direction, -Math.PI / 2), this.moveSpeed * this.moveFactor, camera.map) };
        })

        super([
            new KeyBinding({ code: 'KeyW', onDown: moveForward, whileDown: moveForward }),
            new KeyBinding({ code: 'KeyA', onDown: moveLeft, whileDown: moveLeft }),
            new KeyBinding( {code: 'KeyS', onDown: moveBackward, whileDown: moveBackward }),
            new KeyBinding( {code: 'KeyD', onDown: moveRight, whileDown: moveRight }),
            new KeyBinding( {code: 'ShiftLeft', onDown: () => this.moveFactor = 2, onUp: () => this.moveFactor = 1})
        ])
    }
}

export class BirdsEyeCameraControls extends KeyHandler {
    moveSpeed: number = 0.25;
    sensitivity: number = 1;
    
    constructor(setCamera: React.Dispatch<React.SetStateAction<Camera>>) {

        const moveForward = () => setCamera(camera => ({ ...camera, position: getMovedCameraPosition(camera.position, camera.direction, this.moveSpeed * this.sensitivity, camera.map) }) )
        const moveBackward = () => setCamera(camera => ({ ...camera, position: getMovedCameraPosition(camera.position, scaleVector2(camera.direction, -1), this.moveSpeed * this.sensitivity, camera.map) }) )
        const turnRight = () => setCamera(camera => ({ ...camera, direction: rotateVector2(camera.direction, -this.sensitivity * Math.PI / 180) }));
        const turnLeft = () => setCamera(camera => ({ ...camera, direction: rotateVector2(camera.direction, this.sensitivity * Math.PI / 180) }));
        
        const slowDown = () => {
            this.sensitivity = 0.5;
        }

        super([
            new KeyBinding({ code: 'KeyW', onDown: moveForward, whileDown: moveForward }),
            new KeyBinding({ code: 'KeyA', onDown: turnLeft, whileDown: turnLeft }),
            new KeyBinding( {code: 'KeyS', onDown: moveBackward, whileDown: moveBackward }),
            new KeyBinding( {code: 'KeyD', onDown: turnRight, whileDown: turnRight }),
            new KeyBinding( {code: 'ShiftLeft', onDown: () => this.sensitivity = 2, onUp: () => this.sensitivity = 1}),
            new KeyBinding( { code: "KeyQ", onDown: slowDown, onUp: () => this.sensitivity = 1})
        ])
    }
}
