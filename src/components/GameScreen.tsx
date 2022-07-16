import React, { KeyboardEvent, KeyboardEventHandler, RefObject, useEffect, useRef } from 'react'
import { Angle } from '../classes/Angle';
import { Camera } from '../classes/Camera'
import { KeyBinding } from '../classes/KeyBinding';
import { KeyHandler } from '../classes/KeyHandler';
import { StatefulData } from '../interfaces/StatefulData'


export const GameScreen = ( { cameraData  }: { cameraData: StatefulData<Camera> }  ) => {
    const gameCanvas: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [camera, setCamera] = cameraData;

    const moveForward =  () => setCamera((camera) => camera.setPosition(camera.position.add(camera.direction.toLength(0.25))))
    const moveBackward = () => setCamera((camera) => camera.setPosition(camera.position.subtract(camera.direction.toLength(0.25))))
    const turnRight = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(-1))));
    const turnLeft = () => setCamera((camera) => camera.setDirection(camera.direction.rotate(Angle.fromDegrees(1))));



    const keyHandler = useRef(new KeyHandler([
        new KeyBinding({ key: 'w', onDown: moveForward }),
        new KeyBinding({ key: 'a', onDown: turnLeft }),
        new KeyBinding( {key: 's', onDown: moveBackward }),
        new KeyBinding( {key: 'd', onDown: turnRight }),
    ]))

    function render() {
        if (gameCanvas.current != null) {
            console.log("rendering game");
            cameraData[0].render(gameCanvas.current);
        }
    }

    const loopInProgress = useRef(false);

    function movementLoop() {
        keyHandler.current.callDownedBindings();
        setTimeout( () => requestAnimationFrame(movementLoop), 1 / 30);
    }

    useEffect( () => {
        render();
        if (loopInProgress.current === false) {
            loopInProgress.current = true;
            setTimeout( () => requestAnimationFrame(movementLoop), 1 / 30);
        }
    }, [camera])

  return (
    <div onKeyDown={(event) => keyHandler.current.onKeyDown(event)} onKeyUp={(event) => keyHandler.current.onKeyUp(event)} tabIndex={0}>
        <canvas ref={gameCanvas} width={16 * 20} height={9 * 20} style={{backgroundColor: 'black'}}> </canvas>
        <p> {camera.toString()} </p> 
    </div>
  )
}
