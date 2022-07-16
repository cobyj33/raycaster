import React from "react";
import { Angle } from "./Angle";
import { Camera } from "./Camera";
import { GameMap } from "./GameMap";
import { KeyBinding } from "./KeyBinding";
import { KeyHandler } from "./KeyHandler";
import { WallTile } from "./Tiles/WallTile";
import { Vector2 } from "./Vector2";

const MOVEMENT_CHECKING_DISTANCE = 0.05;

export class CameraControls extends KeyHandler {
    
    constructor(setCamera: React.Dispatch<React.SetStateAction<Camera>>) {

        const canMove = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): boolean => {
            const nextPosition = currentPosition.add(currentDirection.toLength(distance));
            const checkingPosition = nextPosition.add(currentDirection.toLength(MOVEMENT_CHECKING_DISTANCE * ( distance < 0 ? -1 : 1 )));
            const nextRowOnMap = Math.floor(checkingPosition.row);
            const nextColOnMap = Math.floor(checkingPosition.col);
            if (map.inBounds(nextRowOnMap, nextColOnMap)) {
                if (!(map.at(nextRowOnMap, nextColOnMap) instanceof WallTile) ) {
                    return true
                }
            }
            return false;
        }

        const move = (currentPosition: Vector2, currentDirection: Vector2, distance: number, map: GameMap): Vector2 => {
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

        // const moveForward =  () => setCamera( (camera) => {
        //         const nextPosition = camera.position.add(camera.direction.toLength(0.25));
        //         const checkingPosition = nextPosition.add(camera.direction.toLength(0.05));
        //         const nextRowOnMap = Math.floor(checkingPosition.row);
        //         const nextColOnMap = Math.floor(checkingPosition.col);
        //         if (camera.map.inBounds(nextRowOnMap, nextColOnMap)) {
        //             if (!(camera.map.at(nextRowOnMap, nextColOnMap) instanceof WallTile) ) {
        //                 return camera.setPosition(nextPosition);
        //             }
        //         }
        //         return camera;
        //     } )


        // const moveBackward = () => setCamera( (camera) => {
        //     const nextPosition = camera.position.add(camera.direction.toLength(-0.25));
        //     const checkingPosition = nextPosition.add(camera.direction.toLength(-0.05));
        //     const nextRowOnMap = Math.floor(checkingPosition.row);
        //     const nextColOnMap = Math.floor(checkingPosition.col);
        //     if (camera.map.inBounds(nextRowOnMap, nextColOnMap)) {
        //         if (!(camera.map.at(nextRowOnMap, nextColOnMap) instanceof WallTile) ) {
        //             return camera.setPosition(nextPosition);
        //         }
        //     }
        //     return camera;
        // } )

        const moveForward = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction, 0.25, camera.map) );
        })

        const moveBackward = () => setCamera( (camera) => {
            return camera.setPosition( move(camera.position, camera.direction.scale(-1), 0.25, camera.map) );
        })


        // const moveForward = () => setCamera((camera) => camera.setPosition(camera.position.add(camera.direction.toLength(0.25))));
        // const moveBackward = () => setCamera((camera) => camera.setPosition(camera.position.add(camera.direction.toLength(-0.25))));


        const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-1))));
        const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(1))));
        
        super([
            new KeyBinding({ key: 'w', onDown: moveForward, whileDown: moveForward }),
            new KeyBinding({ key: 'a', onDown: turnLeft, whileDown: turnLeft }),
            new KeyBinding( {key: 's', onDown: moveBackward, whileDown: moveBackward }),
            new KeyBinding( {key: 'd', onDown: turnRight, whileDown: turnRight }),
        ])
    }
}