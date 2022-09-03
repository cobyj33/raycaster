import {useEffect, useRef, useState } from 'react';
import { Camera, GameMap, Tile, getDefaultCamera, getFilledMapEdges, getEmptyMap, scaleVector2, TileTypeArray, getDefaultTile } from "raycaster/interfaces"
import { MapScreen, GameScreen, MapEditor, ToolTip } from 'raycaster/components';
import { FaBars } from 'react-icons/fa';
import './App.scss';
import {initRaycaster} from 'loader';


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
type Menus = typeof acceptedMenus[number];

const STARTING_MAP_DIMENSIONS = { row: 50, col: 50 }

function App() {
  const [savedTiles, setSavedTiles] = useState<{ [key: string]: Tile }>({});
  // const [gameMap, setGameMap] = useState<GameMap>(getGenerationAlgorithm("Recursive Backtracker").generateMap(({ row: 50, col: 50 })) );
  const [gameMap, setGameMap] = useState<GameMap>(getFilledMapEdges(getEmptyMap(STARTING_MAP_DIMENSIONS)));
  const [camera, setCamera] = useState<Camera>({ ...getDefaultCamera(gameMap), position: scaleVector2(STARTING_MAP_DIMENSIONS, 0.5)  } );
  const [currentMenu, setCurrentMenu] = useState<Menus>("Camera View");
  // const [currentSecondMenu, setCurrentSecondMenu] = useState<Menus | null>(null);
  const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);

    useEffect( () => {
        initRaycaster().then( () => { 
            const newMap = getFilledMapEdges(getEmptyMap(STARTING_MAP_DIMENSIONS));
            setGameMap(newMap)
            setCamera({ ...getDefaultCamera(newMap), position: scaleVector2(STARTING_MAP_DIMENSIONS, 0.5)  })
            
            const customTiles: { [key: string]: Tile } = {};
            TileTypeArray.forEach(tileName => customTiles[tileName] = getDefaultTile(tileName));
            delete customTiles["Empty Tile"];
            setSavedTiles(customTiles);
        })
    }, [])

  useEffect( () => {
    setCamera((camera: Camera) => ({ ...camera, map: gameMap }));
  }, [gameMap])

  function getMenu(menu: Menus) {
    switch(menu) {
      case "Game Map": return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case "Camera View": return <GameScreen cameraData={[camera, setCamera]} />
      case "Editor": return <MapEditor cameraData={[camera, setCamera]} mapData={[gameMap, setGameMap]} tileData={[savedTiles, setSavedTiles]} />
    }
  }


  const sidebarOpenReference = useRef<HTMLButtonElement>(null);
  return (
    <div className="app" tabIndex={0} >
      <div className={`sidebar ${sidebarOpened ? 'opened' : ''}`}>
        <button ref={sidebarOpenReference} className="sidebar-open-button" onClick={() => setSidebarOpened(!sidebarOpened)}>
          <ToolTip target={sidebarOpenReference}> SideBar </ToolTip>
            <FaBars />
          </button>

        <div className='sidebar-content-area'>
          { acceptedMenus.map(menu => <button className={`screen-picking-button ${currentMenu.toString() === menu ? 'opened' : ''}`} key={menu} onClick={() => setCurrentMenu(menu)}> { menu } </button> )}
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
      { /* currentSecondMenu !== null ? getMenu(currentSecondMenu) : '' */ }

      {/* <div className='menu-switch-buttons'>
        <button className='menu-switch-button back'  onClick={() => setCurrentMenu(menus.back()) } onFocus={(event) => event.target.blur()}> To: { menus.peekBack().toString() } </button>
        <button className='menu-switch-button forward' onClick={() => setCurrentMenu(menus.forward())} onFocus={(event) => event.target.blur()}> To: { menus.peekForward().toString() } </button>
      </div> */}


    </div>
  );
}

export default App;
