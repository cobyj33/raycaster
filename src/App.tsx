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
import { CyclicalArray } from './classes/CyclicalArray';

enum Menu {
  GAMEMAP, CAMERAVIEW
}

const menus = new CyclicalArray<Menu>([Menu.GAMEMAP, Menu.CAMERAVIEW]);

function App() {
  const [gameMap, setGameMap] = useState<GameMap>(GameMap.random(new Dimension(30, 30), 30)   );
  const [camera, setCamera] = useState<Camera>(new Camera(gameMap, gameMap.center, Vector2.right));
  const [currentMenu, setCurrentMenu] = useState<Menu>(Menu.CAMERAVIEW);

  const ref: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  useEffect( () => {
    setCamera(camera.setMap(gameMap));
  }, [gameMap])

  function getMenu(menu: Menu) {
    switch(menu) {
      case Menu.GAMEMAP: return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case Menu.CAMERAVIEW: return <GameScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
    }
  }



  return (
    <div className="app">
      { getMenu(currentMenu)}
      <div className='menu-switch-buttons'>
        <button className='menu-switch-button back'  onClick={() => setCurrentMenu(menus.back()) } onFocus={(event) => event.target.blur()}> To: { menus.peekBack().toString() } </button>
        <button className='menu-switch-button forward' onClick={() => setCurrentMenu(menus.forward())} onFocus={(event) => event.target.blur()}> To: { menus.peekForward().toString() } </button>
      </div>
    </div>
  );
}

export default App;