import React from 'react';
import { Camera, GameMap, Tile, getDefaultCamera, getFilledMapEdges, getEmptyMap, scaleVector2, TileTypeArray, getDefaultTile } from "raycaster/interfaces"
import { MapScreen, GameScreen, MapEditor } from 'raycaster/components';
import { AiFillCamera, AiFillBook, AiOutlineSplitCells, AiFillSave, AiOutlineImport, AiFillFileAdd  } from 'react-icons/ai';
import { BsFillMapFill, BsFillPaletteFill } from "react-icons/bs"
import { BiHelpCircle } from "react-icons/bi"
import appStyles from 'App.module.css';
import {initRaycaster} from 'loader';
import { requestWebDownload } from 'functions/file';
import { JRaycaster } from 'classes/app';

// import JRLogo from "assets/JRWhite.svg"


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
type Menus = typeof acceptedMenus[number];

const STARTING_MAP_DIMENSIONS = { row: 50, col: 50 }

interface MenuState {
  menus: [Menus] | [Menus, Menus]
  split: boolean
}

function App() {
    // const [app, setApp] = React.useState<JRaycaster>(new JRaycaster(STARTING_MAP_DIMENSIONS))
    const [savedTiles, setSavedTiles] = React.useState<{ [key: string]: Tile }>({});
    const [gameMap, setGameMap] = React.useState<GameMap>(getFilledMapEdges(getEmptyMap(STARTING_MAP_DIMENSIONS)));
    const [camera, setCamera] = React.useState<Camera>({ ...getDefaultCamera(gameMap), position: scaleVector2(STARTING_MAP_DIMENSIONS, 0.5)  } );
    const [currentMenu, setCurrentMenu] = React.useState<Menus>("Camera View")

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

  function save() {

  }


  return (
    <div className={appStyles["app"]} tabIndex={0} >

      <nav className={appStyles["nav-bar"]}>
        {/* <div className="nav-bar-logo-holder">
          <img className="nav-bar-logo" src={JRLogo} alt="JJ Raycaster" />
        </div> */}

        <div className={appStyles["nav-button-group"]}>
          <button className={appStyles["nav-button"]} onClick={() => setCurrentMenu("Camera View")}><AiFillCamera /></button>
          <button className={appStyles["nav-button"]} onClick={() => setCurrentMenu("Game Map")}><BsFillMapFill /></button>
          <button className={appStyles["nav-button"]} onClick={() => setCurrentMenu("Editor")}><BsFillPaletteFill /></button>
          <button className={appStyles["nav-button"]}><BiHelpCircle /></button>
          <button className={appStyles["nav-button"]}><AiFillBook /></button>
        </div>

        <div className={appStyles["nav-button-group"]}> {/* File Manipulation */}
          <button className={appStyles["nav-button"]}><AiFillFileAdd /></button>
          <button className={appStyles["nav-button"]}><AiFillSave /></button>
          <button className={appStyles["nav-button"]}><AiOutlineImport /></button>
        </div>

        {/* <div className={appStyles["view-button-group"]}> 
          <button className={appStyles["nav-button"]}><AiOutlineSplitCells /></button>
        </div> */}
      </nav>

      <div className={`${appStyles["viewing-area"]} ${appStyles["single"]}`}>
        { getMenu(currentMenu) }
      </div>

    </div>
  );
}

export default App;
