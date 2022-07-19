import React, { KeyboardEvent } from "react";
import { Angle } from "./Data/Angle";
import { Camera } from "./Camera";
import { GameMap } from "./GameMap";
import { KeyBinding } from "./KeySystem/KeyBinding";
import { KeyHandler } from "./KeySystem/KeyHandler";
import { WallTile } from "./Tiles/WallTile";
import { Vector2 } from "./Data/Vector2";

const MOVEMENT_CHECKING_DISTANCE = 0.05;

export const canMove = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): boolean => {
    const nextPosition = currentPosition.add(currentDirection.toLength(distance));
    const checkingPosition = nextPosition.add(currentDirection.toLength(MOVEMENT_CHECKING_DISTANCE * ( distance < 0 ? -1 : 1 )));
    const nextRowOnMap = Math.floor(checkingPosition.row);
    const nextColOnMap = Math.floor(checkingPosition.col);
    if (map.inBounds(nextRowOnMap, nextColOnMap)) {
        if (!(map.at(nextRowOnMap, nextColOnMap).canCollide()) ) {
            return true
        }
    }
    return false;
}

export const move = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): Vector2 => {
    const nextPosition = currentPosition.add(currentDirection.toLength(distance));
    if (canMove(currentPosition, currentDirection, distance, map)) {
        return nextPosition;
    } else {
        const rowDirection: Vector2 = currentDirection.toLength(distance).getRowComponent();
        const colDirection: Vector2 = currentDirection.toLength(distance).getColComponent();
        if (canMove(currentPosition, rowDirection, distance, map)) {
            return currentPosition.add(rowDirection);
        } else if (canMove(currentPosition, colDirection, distance, map)) {
            return currentPosition.add(colDirection);
        }
    }
    return currentPosition;
}

export class FirstPersonCameraControls extends KeyHandler {
    moveSpeed: number = 0.25;
    moveFactor: number = 1;
    
    constructor(setCamera: React.Dispatch<React.SetStateAction<Camera>>) {


        const moveForward = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction, this.moveSpeed * this.moveFactor, camera.map) );
        })

        const moveBackward = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction.scale(-1), this.moveSpeed * this.moveFactor, camera.map) );
        })

        const moveLeft = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(90)), this.moveSpeed * this.moveFactor, camera.map) );
        })

        const moveRight = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction.rotate(Angle.fromDegrees(-90)), this.moveSpeed * this.moveFactor, camera.map) );
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

        const moveForward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction, this.moveSpeed * this.sensitivity, camera.map) ))
        const moveBackward = () => setCamera( (camera) => camera.setPosition( move(camera.position, camera.direction.scale(-1), this.moveSpeed * this.sensitivity, camera.map) ))
        const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-this.sensitivity))));
        const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(this.sensitivity))));
        
        const slowDown = (e: KeyboardEvent<Element>) => {
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