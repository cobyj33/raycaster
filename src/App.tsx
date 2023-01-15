import React, { ButtonHTMLAttributes } from 'react';
import { Camera, GameMap, Tile, TileTypeArray, getDefaultTile, RGBA, ICamera, SkyBox } from "raycaster/interfaces"
import { MapScreen, GameScreen, MapEditor } from 'raycaster/components';
import { AiFillCamera, AiFillBook, AiOutlineSplitCells, AiFillSave, AiOutlineImport, AiFillFileAdd  } from 'react-icons/ai';
import { BsFillMapFill, BsFillPaletteFill } from "react-icons/bs"
import { BiHelpCircle } from "react-icons/bi"
import appStyles from 'App.module.css';
import {initRaycaster} from 'loader';
import { requestWebDownload } from 'functions/file';
import MapScreenHelpMenu from 'components/help/MapScreenHelpMenu';
import GameScreenHelpMenu from 'components/help/GameScreenHelpMenu';
import MapEditorHelpMenu from 'components/help/MapEditorHelpMenu';
import { IDimension2D } from 'interfaces/Dimension';

// import JRLogo from "assets/JRWhite.svg"


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
export type Menus = typeof acceptedMenus[number];

const STARTING_MAP_DIMENSIONS: IDimension2D = { width: 50, height: 50 }

function NavButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={appStyles["nav-button"]} />
}

function SelectableNavButton({ selected, ...props }: { selected: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`${appStyles["nav-button"]} ${selected ? appStyles["selected"] : ""} ${props.className ?? ""}`} />
}


function App() {
    // const [app, setApp] = React.useState<JRaycaster>(new JRaycaster(STARTING_MAP_DIMENSIONS))
    const [savedTiles, setSavedTiles] = React.useState<{ [key: string]: Tile }>({});
    const [gameMap, setGameMap] = React.useState<GameMap>(GameMap.filledEdges("Starting Map", STARTING_MAP_DIMENSIONS));
    const [camera, setCamera] = React.useState<Camera>(Camera.default().place(gameMap.center));
    const [currentMenu, setCurrentMenu] = React.useState<Menus>("Camera View")
    const [showHelp, setShowHelp] = React.useState<boolean>(false)

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

  function getHelpMenu(menu: Menus) {
    switch(menu) {
      case "Game Map": return <MapScreenHelpMenu />;
      case "Camera View": return <GameScreenHelpMenu  />
      case "Editor": return <MapEditorHelpMenu />
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
          <SelectableNavButton selected={currentMenu === "Camera View"}  onClick={() => setCurrentMenu("Camera View")}><AiFillCamera /></SelectableNavButton>
          <SelectableNavButton selected={currentMenu === "Game Map"} onClick={() => setCurrentMenu("Game Map")}><BsFillMapFill /></SelectableNavButton>
          <SelectableNavButton selected={currentMenu === "Editor"} onClick={() => setCurrentMenu("Editor")}><BsFillPaletteFill /></SelectableNavButton>
          {/* <button className={appStyles["nav-button"]}><BiHelpCircle /></button>
          <button className={appStyles["nav-button"]}><AiFillBook /></button> */}
        </div>

        <div className={appStyles["nav-button-group"]}> {/* Actions Manipulation */}
          <NavButton className={appStyles["nav-button"]} onClick={createNew}><AiFillFileAdd /></NavButton>
          <SelectableNavButton selected={showHelp} onClick={() => setShowHelp(curr => !curr)}><BiHelpCircle /></SelectableNavButton>
          {/* <button className={appStyles["nav-button"]} onClick={save}><AiFillSave /></button>
          <button className={appStyles["nav-button"]} onClick={load}><AiOutlineImport /></button> */}
        </div>

        {/* <div className={appStyles["view-button-group"]}> 
          <button className={appStyles["nav-button"]}><AiOutlineSplitCells /></button>
        </div> */}
      </nav>



      <div className={`${appStyles["viewing-area"]} ${appStyles["single"]}`}>
        { showHelp ? getHelpMenu(currentMenu) : getMenu(currentMenu) }
      </div>

    </div>
  );
}

export default App;
