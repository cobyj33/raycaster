import React, { RefObject, useEffect, useReducer, useRef, useState } from 'react';
import './App.css';
import { Camera } from './classes/Camera';
import { GameMap } from './classes/GameMap';
import { Dimension } from './classes/Data/Dimension';
import { GameScreen } from './components/GameScreen';
import { Vector2 } from './classes/Data/Vector2';
import { MapScreen } from './components/MapScreen';
import { CyclicalArray } from './classes/Structures/CyclicalArray';
import { KeyHandler, useKeyHandler } from './classes/KeyHandler';
import { KeyBinding } from './classes/KeyBinding';
import { MapEditor } from './components/MapEditor';

enum Menu {
  GAMEMAP, CAMERAVIEW, EDITOR
}

const menus = new CyclicalArray<Menu>([Menu.GAMEMAP, Menu.CAMERAVIEW, Menu.EDITOR]);

function App() {
  const [gameMap, setGameMap] = useState<GameMap>(GameMap.filledEdges(new Dimension(50, 50))   );
  const [camera, setCamera] = useState<Camera>(new Camera(gameMap, gameMap.center, Vector2.right));
  const [currentMenu, setCurrentMenu] = useState<Menu>(Menu.CAMERAVIEW);

  const ref: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  const keyHandler = useKeyHandler(new KeyHandler( [
    new KeyBinding({ key: 'LeftArrow', onDown: () => setCurrentMenu(menus.back()) }),
    new KeyBinding({ key: 'RightArrow', onDown: () => setCurrentMenu(menus.forward()) })
  ]  ))

  useEffect( () => {
    setCamera(camera.setMap(gameMap));
  }, [gameMap])

  function getMenu(menu: Menu) {
    switch(menu) {
      case Menu.GAMEMAP: return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case Menu.CAMERAVIEW: return <GameScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
      case Menu.EDITOR: return <MapEditor mapData={[gameMap, setGameMap]} />
    }
  }

  return (
    <div className="app" onKeyDown={(event) => keyHandler.current.onKeyDown(event)} onKeyUp={(event) => keyHandler.current.onKeyUp(event)} tabIndex={0}>
      { getMenu(currentMenu)}
      <div className='menu-switch-buttons'>
        <button className='menu-switch-button back'  onClick={() => setCurrentMenu(menus.back()) } onFocus={(event) => event.target.blur()}> To: { menus.peekBack().toString() } </button>
        <button className='menu-switch-button forward' onClick={() => setCurrentMenu(menus.forward())} onFocus={(event) => event.target.blur()}> To: { menus.peekForward().toString() } </button>
      </div>
    </div>
  );
}

export default App;