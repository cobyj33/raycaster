import React, { RefObject, useEffect, useReducer, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { CameraLine } from './classes/CameraLine';
import { Camera } from './classes/Camera';
import { GameMap } from './classes/GameMap';
import { Dimension } from './classes/Dimension';
import { GameScreen } from './components/GameScreen';
import { Vector2 } from './classes/Vector2';
import { MapScreen } from './components/MapScreen';
import { WallTile } from './classes/Tiles/WallTile';

function App() {
  const [gameMap, setGameMap] = useState<GameMap>(GameMap.random(new Dimension(30, 30), 30)   );
  const [camera, setCamera] = useState<Camera>(new Camera(gameMap, gameMap.center, Vector2.right));

  const ref: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  useEffect( () => {
    setCamera(camera.setMap(gameMap));
  }, [gameMap])

  // console.log(gameMap);

  // if (ref.current != null) {
  //   console.log(camera.render(ref.current));
  // }

  return (
    <div className="App">
      <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
      <GameScreen cameraData={[camera, setCamera]} />
      <canvas width={200} height={200} > </canvas>
    </div>
  );
}

export default App;