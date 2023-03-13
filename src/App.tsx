import React from 'react';
import { Camera } from 'libray/Camera';
import { GameMap } from 'libray/GameMap';
import { Tile, TileTypeArray, getDefaultTile } from 'libray/Tile';
import { StatefulData } from 'jsutil/react';

import {initRaycaster} from 'loader';

import { MapScreen } from 'components/screens/MapScreen';
import { GameScreen } from 'components/screens/GameScreen';
import { MapEditor } from 'components/screens/MapEditor';
import MapScreenHelpMenu from 'components/help/MapScreenHelpMenu';
import GameScreenHelpMenu from 'components/help/GameScreenHelpMenu';
import MapEditorHelpMenu from 'components/help/MapEditorHelpMenu';
import { IDimension2D } from 'jsutil';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Page from 'components/global/Page';
import ErrorPage from 'components/global/ErrorPage';


// import JRLogo from "assets/JRWhite.svg"


const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
export type Menus = typeof acceptedMenus[number];

export const STARTING_MAP_DIMENSIONS: IDimension2D = { width: 50, height: 50 }
export interface AppState { 
    gameMap: GameMap,
    savedTiles: { [key: string]: Tile },
    camera: Camera
}

export type AppStatefulState = { [K in keyof AppState]: StatefulData<AppState[K]> }


export function createNewAppState(dimensions: IDimension2D): AppState {
    const defaultMap = GameMap.filledEdges("Starting Map", STARTING_MAP_DIMENSIONS)
    const customTiles: { [key: string]: Tile } = {};
    TileTypeArray.forEach(tileName => customTiles[tileName] = getDefaultTile(tileName));
    delete customTiles["Empty Tile"];

    return {
        gameMap: defaultMap,
        camera: Camera.default().place(defaultMap.center),
        savedTiles: customTiles
    }
}

export function setNewAppState(dimensions: IDimension2D, state: AppStatefulState): void {
    const { savedTiles: [savedTiles, setSavedTiles], gameMap: [gameMap, setGameMap], camera: [camera, setCamera] } = state
    const { gameMap: newGameMap, camera: newCamera, savedTiles: newSavedTiles } = createNewAppState(STARTING_MAP_DIMENSIONS)
    setGameMap(newGameMap)
    setCamera(newCamera)
    setSavedTiles(newSavedTiles)
}


function App() {
    const [savedTiles, setSavedTiles] = React.useState<{ [key: string]: Tile }>({});
    const [gameMap, setGameMap] = React.useState<GameMap>(GameMap.filledEdges("Starting Map", STARTING_MAP_DIMENSIONS));
    const [camera, setCamera] = React.useState<Camera>(Camera.default().place(gameMap.center));
    const appState: AppStatefulState = { savedTiles: [savedTiles, setSavedTiles], camera: [camera, setCamera], gameMap: [gameMap, setGameMap] }

    React.useEffect( () => {
        initRaycaster().then(() => setNewAppState(STARTING_MAP_DIMENSIONS, appState))
    }, [])

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Page {...appState} />,
            errorElement: <ErrorPage {...appState} />,
            children: [
                {
                    path: "/camera",
                    element: <GameScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]}  />
                },
                {
                    path: "/bird",
                    element: <MapScreen mapData={[gameMap, setGameMap]} cameraData={[camera, setCamera]} />
                },
                {
                    path: "/editor",
                    element: <MapEditor cameraData={[camera, setCamera]} mapData={[gameMap, setGameMap]} tileData={[savedTiles, setSavedTiles]} />
                },
                {
                    path: "/camera/help",
                    element: <GameScreenHelpMenu />
                },
                {
                    path: "/bird/help",
                    element: <MapScreenHelpMenu />
                },
                {
                    path: "/editor/help",
                    element: <MapEditorHelpMenu />
                }
            ]
        },
    ], { basename: "/raycaster"})

  return <RouterProvider router={router} />;
}
  

export default App;
