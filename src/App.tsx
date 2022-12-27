import React from 'react';
import { Camera, GameMap, Tile, getDefaultCamera, getFilledMapEdges, getEmptyMap, scaleVector2, TileTypeArray, getDefaultTile } from "raycaster/interfaces"
import { MapScreen, GameScreen, MapEditor } from 'raycaster/components';
import { FaBars } from 'react-icons/fa';
import './App.scss';
import {initRaycaster} from 'loader';


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
type Menus = typeof acceptedMenus[number];

const STARTING_MAP_DIMENSIONS = { row: 50, col: 50 }

function App() {
    const [savedTiles, setSavedTiles] = React.useState<{ [key: string]: Tile }>({});
    const [gameMap, setGameMap] = React.useState<GameMap>(getFilledMapEdges(getEmptyMap(STARTING_MAP_DIMENSIONS)));
    const [camera, setCamera] = React.useState<Camera>({ ...getDefaultCamera(gameMap), position: scaleVector2(STARTING_MAP_DIMENSIONS, 0.5)  } );
    const [currentMenus, setCurrentMenus] = React.useState<[Menus, Menus | undefined]>(["Camera View", "Game Map"]);
    const [leftSidebarOpened, setLeftSidebarOpened] = React.useState<boolean>(false);
    const [rightSidebarOpened, setRightSidebarOpened] = React.useState<boolean>(false);

    React.useEffect( () => {
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

  React.useEffect( () => {
    setCamera((camera: Camera) => ({ ...camera, map: gameMap }));
  }, [gameMap])

  function getMenu(menu: Menus) {
    switch(menu) {
      case "Game Map": return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case "Camera View": return <GameScreen cameraData={[camera, setCamera]} />
      case "Editor": return <MapEditor cameraData={[camera, setCamera]} mapData={[gameMap, setGameMap]} tileData={[savedTiles, setSavedTiles]} />
    }
  }


  return (
    <div className="app" tabIndex={0} >

      <div className={`sidebar left ${leftSidebarOpened ? 'opened' : ''}`}>
        <button className="sidebar-open-button" onClick={() => setLeftSidebarOpened(!leftSidebarOpened)}>
            <FaBars />
          </button>

        <div className='sidebar-content-area'>
          { acceptedMenus.map(menu => <button className={`screen-picking-button ${currentMenus[0] === menu ? 'opened' : ''}`} key={menu} onClick={() => setCurrentMenus([menu, currentMenus[1]])}> { menu } </button> )}
        </div>
      </div>

      <div className={`sidebar right ${rightSidebarOpened ? 'opened' : ''}`}>
        <button className="sidebar-open-button" onClick={() => setRightSidebarOpened(!rightSidebarOpened)}>
            <FaBars />
          </button>

        <div className='sidebar-content-area'>
          { acceptedMenus.map(menu => <button className={`screen-picking-button ${currentMenus[1] === menu ? 'opened' : ''}`} key={menu} onClick={() => setCurrentMenus([currentMenus[0], menu])}> { menu } </button> )}
            <button className={`screen-picking-button ${currentMenus[1] === undefined ? 'opened' : ''}`} onClick={() => setCurrentMenus([currentMenus[0], undefined])}> Close Extra Menu </button>
        </div>
      </div>

      <div className="viewing-area">
        { getMenu(currentMenus[0]) }
        { currentMenus[1] !== null && currentMenus[1] !== undefined ? getMenu(currentMenus[1]) : '' }
      </div>

    </div>
  );
}

export default App;
