import {RefObject, useEffect, useRef, useState } from 'react';
import './App.css';
import { Camera } from './classes/Camera';
import { GameMap } from './classes/GameMap';
import { Dimension } from './classes/Data/Dimension';
import { GameScreen } from './components/GameScreen';
import { Vector2 } from './classes/Data/Vector2';
import { MapScreen } from './components/MapScreen';
import { CyclicalArray } from './classes/Structures/CyclicalArray';
import { KeyHandler, useKeyHandler } from './classes/KeySystem/KeyHandler';
import { KeyBinding } from './classes/KeySystem/KeyBinding';
import { MapEditor } from './components/MapEditor';
import { Tile } from './interfaces/Tile';
import { WallTile } from './classes/Tiles/WallTile';
import { FaBars } from 'react-icons/fa';
import { ToolTip } from './components/ToolTip/ToolTip';

enum Menu {
  GAMEMAP = "Game Map",
  CAMERAVIEW = "Camera View",
  EDITOR = "Editor"
}

const menus = new CyclicalArray<Menu>([Menu.GAMEMAP, Menu.CAMERAVIEW, Menu.EDITOR]);

function App() {
  const [customTiles, setCustomTiles] = useState<Tile[]>([new WallTile()]);
  const [gameMap, setGameMap] = useState<GameMap>(GameMap.filledEdges(new Dimension(10, 10))   );
  const [camera, setCamera] = useState<Camera>(new Camera(gameMap, gameMap.center, Vector2.right));
  const [currentMenu, setCurrentMenu] = useState<Menu>(Menu.CAMERAVIEW);
  const [currentSecondMenu, setCurrentSecondMenu] = useState<Menu | null>(null);

  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

  const ref: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  const keyHandler = useKeyHandler(new KeyHandler( [
    new KeyBinding({ code: 'ArrowLeft', onDown: () => setCurrentMenu(menus.back()) }),
    new KeyBinding({ code: 'ArrowRight', onDown: () => setCurrentMenu(menus.forward()) })
  ]  ))

  useEffect( () => {
    setCamera(camera.setMap(gameMap));
  }, [gameMap])

  function getMenu(menu: Menu) {
    switch(menu) {
      case Menu.GAMEMAP: return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case Menu.CAMERAVIEW: return <GameScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
      case Menu.EDITOR: return <MapEditor mapData={[gameMap, setGameMap]} tileData={[customTiles, setCustomTiles]} />
    }
  }


  const sidebarOpenReference = useRef<HTMLButtonElement>(null);
  return (
    <div className="app" onKeyDown={(event) => keyHandler.current.onKeyDown(event)} onKeyUp={(event) => keyHandler.current.onKeyUp(event)} tabIndex={0}>
      <div className={`sidebar ${sidebarOpened ? 'opened' : ''}`}>
        <button ref={sidebarOpenReference} className="sidebar-open-button" onClick={() => setSidebarOpened(!sidebarOpened)}>
          <ToolTip target={sidebarOpenReference}> SideBar </ToolTip>
            <FaBars />
          </button>

        <div className='sidebar-content-area'>
          { Object.keys(Menu).map(menu => <button className={`screen-picking-button ${currentMenu.toString() === menu ? 'opened' : ''}`} key={menu} onClick={() => setCurrentMenu(Menu[menu as keyof typeof Menu])}> { menu } </button> )}
          {/* <button className={`screen-picking-button ${currentMenu === Menu.CAMERAVIEW ? 'opened' : ''}`} onPointerDown={() => setCurrentMenu(Menu.CAMERAVIEW)}> Camera View </button>
          <button className={`screen-picking-button ${currentMenu === Menu.EDITOR ? 'opened' : ''}`} onClick={() => setCurrentMenu(Menu.EDITOR)}> Editor </button>
          <button className={`screen-picking-button ${currentMenu === Menu.GAMEMAP ? 'opened' : ''}`} onClick={() => setCurrentMenu(Menu.GAMEMAP)}> Game Map </button> */}

          {/* <div className='open-other-screen-container'>
          <button className='open-extra-screen-button'> </button> 
            <div className='open-extra-screen-options'>
              { Object.keys(Menu).map(menu => <button className={`screen-picking-button ${currentSecondMenu?.toString?.() === menu ? 'opened' : ''}`} key={menu} onClick={() => { currentSecondMenu === Menu[menu as keyof typeof Menu] ?  setCurrentSecondMenu(null) : setCurrentSecondMenu(Menu[menu as keyof typeof Menu]) }  }> { menu } </button> )}
            </div>
          </div> */}
        </div>
      </div>

      { getMenu(currentMenu) }
      { currentSecondMenu !== null ? getMenu(currentSecondMenu) : '' }

      {/* <div className='menu-switch-buttons'>
        <button className='menu-switch-button back'  onClick={() => setCurrentMenu(menus.back()) } onFocus={(event) => event.target.blur()}> To: { menus.peekBack().toString() } </button>
        <button className='menu-switch-button forward' onClick={() => setCurrentMenu(menus.forward())} onFocus={(event) => event.target.blur()}> To: { menus.peekForward().toString() } </button>
      </div> */}


    </div>
  );
}

export default App;