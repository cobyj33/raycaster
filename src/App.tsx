import React from 'react';
import { Camera, GameMap, Tile, TileTypeArray, getDefaultTile, RGBA, ICamera, SkyBox } from "raycaster/interfaces"
import { MapScreen, GameScreen, MapEditor } from 'raycaster/components';
import { AiFillCamera, AiFillBook, AiOutlineSplitCells, AiFillSave, AiOutlineImport, AiFillFileAdd  } from 'react-icons/ai';
import { BsFillMapFill, BsFillPaletteFill } from "react-icons/bs"
import { BiHelpCircle } from "react-icons/bi"
import appStyles from 'App.module.css';
import {initRaycaster} from 'loader';
import { requestWebDownload } from 'functions/file';
import { P } from 'vitest/dist/types-bae746aa';
import { request } from 'http';

// import JRLogo from "assets/JRWhite.svg"


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
type Menus = typeof acceptedMenus[number];

const STARTING_MAP_DIMENSIONS = { row: 50, col: 50 }

// interface RaycasterDataTileSave {
//   color: RGBA
//   canHit: boolean
//   canCollide: boolean
//   texture: string | null
// }

// interface RaycasterDataSkyboxSave implements SkyBox {}

// interface RaycasterDataMapSave {
//   tilemap: string[][]
//   tiles: { [key: string]: RaycasterDataTileSave }
//   width: number
//   height: number
//   skybox: RaycasterDataSkyboxSave
// }

// interface RaycasterDataSave {
//   format: string
//   map: RaycasterDataMapSave
//   camera: ICamera
// }

// function getRaycasterMapSaveData(map: GameMap): RaycasterDataMapSave {
//   return {
//     tilemap: map.tiles.map(tileRow => tileRow.map(tile => tile.))
//     width: map.width,
//     height: map.height,
//     skybox: map.skyBox
//   }
// }

// function getRaycasterCameraSaveData(camera: Camera): ICamera {
//   return camera.data()
// }

// function getRaycasterSaveData(map: GameMap, camera: Camera): RaycasterDataSave {
//   return {
//     format: "v1",
//     map: getRaycasterMapSaveData(map)
//     camera: getRaycasterCameraSaveData(camera)
//   }
// }

// function saveRaycasterSaveData(data: RaycasterDataSave): void {
//   const stringified = JSON.stringify(data)
//   const blob = new Blob([stringified], { type: "application/json"} )
//   requestWebDownload(blob, "raycastersave.json")
// }

interface MenuState {
  menus: [Menus] | [Menus, Menus]
  split: boolean
}

function App() {
    // const [app, setApp] = React.useState<JRaycaster>(new JRaycaster(STARTING_MAP_DIMENSIONS))
    const [savedTiles, setSavedTiles] = React.useState<{ [key: string]: Tile }>({});
    const [gameMap, setGameMap] = React.useState<GameMap>(GameMap.filledEdges("Starting Map", STARTING_MAP_DIMENSIONS));
    const [camera, setCamera] = React.useState<Camera>(Camera.default().place(gameMap.center));
    const [currentMenu, setCurrentMenu] = React.useState<Menus>("Camera View")

    React.useEffect( () => {
        initRaycaster().then(createNew)
    }, [])

  function getMenu(menu: Menus) {
    switch(menu) {
      case "Game Map": return <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />;
      case "Camera View": return <GameScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
      case "Editor": return <MapEditor cameraData={[camera, setCamera]} mapData={[gameMap, setGameMap]} tileData={[savedTiles, setSavedTiles]} />
    }
  }

  function createNew() {
    const newMap = GameMap.filledEdges("Starting Map", STARTING_MAP_DIMENSIONS);
    setGameMap(newMap)
    setCamera(Camera.default().place(newMap.center))
    
    const customTiles: { [key: string]: Tile } = {};
    TileTypeArray.forEach(tileName => customTiles[tileName] = getDefaultTile(tileName));
    delete customTiles["Empty Tile"];
    setSavedTiles(customTiles);
  }

  function save() {
    
  }

  function load() {

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
          {/* <button className={appStyles["nav-button"]}><BiHelpCircle /></button>
          <button className={appStyles["nav-button"]}><AiFillBook /></button> */}
        </div>

        <div className={appStyles["nav-button-group"]}> {/* File Manipulation */}
          <button className={appStyles["nav-button"]} onClick={createNew}><AiFillFileAdd /></button>
          {/* <button className={appStyles["nav-button"]} onClick={save}><AiFillSave /></button>
          <button className={appStyles["nav-button"]} onClick={load}><AiOutlineImport /></button> */}
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
