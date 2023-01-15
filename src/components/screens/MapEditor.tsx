import { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback, ChangeEvent } from 'react'

import { StatefulData, IVector2, View, GameMap, getDefaultTile, Tile, areGameMapsEqual, tryPlaceCamera, Camera, areEqualTiles, Vector2, getViewOffset, inDimensionBounds, rgbaToString } from "raycaster/interfaces";
import { useHistory, useWindowEvent, useResizeObserver, getCanvasAndContext2D, useCanvasHolderUpdater, withCanvasAndContext } from "raycaster/functions";


import { EditMode, EditorData, MoveEditMode, ZoomEditMode, DrawEditMode, EraseEditMode, LineEditMode, BoxEditMode, EllipseEditMode } from "raycaster/editor"
import { HistoryStack } from "raycaster/structures";

import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaBox } from "react-icons/fa"
import { GiStraightPipe } from "react-icons/gi"
import { BsCircle } from 'react-icons/bs'

import mapEditorStyles from "components/styles/MapEditor.module.css"
import { GameScreen } from './GameScreen';
import { IDimension2D } from 'interfaces/Dimension';

type EditorEditMode = "MOVE" | "ZOOM" | "DRAW" | "ERASE" | "LINE" | "BOX" | "ELLIPSE"

export const MapEditor = ( { cameraData, mapData, tileData }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap>, tileData: StatefulData<{[key: string]: Tile}> }) => {
  const mapHistory = useRef<HistoryStack<GameMap>>(new HistoryStack<GameMap>());

  const [camera, setCamera] = cameraData;
  const [map, setMap] = mapData;
  const [savedTiles] = tileData;
  const [selectedTile, setSelectedTile] = useState<Tile>(getDefaultTile("Wall Tile"));

  const [ghostTilePositions, setGhostTilePositions] = useState<IVector2[]>([]);

  const [cursor, setCursor] = useState<string>('crosshair');
  const [view, setView] = useState<View>(new View(Vector2.ZERO, 10));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const lastHoveredCell: MutableRefObject<IVector2> = useRef<Vector2>(Vector2.ZERO);
  const currentHoveredCell: MutableRefObject<IVector2> = useRef<Vector2>(Vector2.ZERO)

  const isPointerDown: MutableRefObject<boolean> = useRef<boolean>(false);

  
  const [tileCreatorOpened, setTileCreatorOpened] = useState<boolean>(false);

  function pointerPositionInCanvas(event: PointerEvent<Element>): Vector2 {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
          return new Vector2(Math.trunc(event.clientY - canvasBounds.y), Math.trunc(event.clientX - canvasBounds.x))
      }
      return Vector2.ZERO
  }

  function canvasToWorld(canvasPosition: Vector2): Vector2 {
    return canvasPosition.scale(1/view.cellSize).add(view)
  }

  function worldToCanvas(worldPosition: Vector2): Vector2 {
    return worldPosition.subtract(view).scale(view.cellSize)
  }

function focus(worldPosition: IVector2) {
    setView(view => {
        let newView = view;
        withCanvasAndContext(canvasRef, (canvas, context) => {
          const worldViewportCenter = new Vector2(canvas.height, canvas.width).scale(1/view.cellSize).scale(1/2)
          const viewPosition = Vector2.fromIVector2(worldPosition).scale(-1).subtract(worldViewportCenter.scale(-1))
          newView = view.withPosition(viewPosition)
        })
        return newView
    })
}

  function center(): void {
    setView(view => { 
      try {
          const [canvas, _] = getCanvasAndContext2D(canvasRef)
          const startingCoordinates: IVector2 = {
              row: map.center.row - (canvas.height / view.cellSize / 2),
              col: map.center.col - (canvas.width / view.cellSize / 2)
          } 
          return view.withPosition(startingCoordinates)
      } catch (error) {
          return view
      }
    })
  }

  function fit(): void {
      setView(view => {
            try {
              const [canvas, _] = getCanvasAndContext2D(canvasRef)
              const viewportSize = new Vector2(canvas.height, canvas.width)
              const cellSize = Math.min(viewportSize.row / map.dimensions.height, viewportSize.col / map.dimensions.width)
              return view.withCellSize(cellSize)
            } catch (error) {
                return view
            }
        })
  }



  function getHoveredCell(event: PointerEvent<Element>): Vector2 {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      return canvasToWorld(pointerPositionInCanvas(event)).trunc()
    }
    return Vector2.ZERO;
  }
  
  const getEditorData: () => EditorData = () => {
    return {
      currentHoveredCell: currentHoveredCell.current,
      lastHoveredCell: lastHoveredCell.current,
      isPointerDown: isPointerDown.current,
      mapData: mapData,
      viewData: [view, setView],
      selectedTile: selectedTile,
      ghostTilePositions: [ghostTilePositions, setGhostTilePositions]
    }
  }
  
  const editorModes: MutableRefObject<{[key in EditorEditMode]: EditMode}> = useRef({ 
    "DRAW": new DrawEditMode(getEditorData()),
    "ZOOM": new ZoomEditMode(getEditorData()),
    "MOVE": new MoveEditMode(getEditorData()),
    "ERASE": new EraseEditMode(getEditorData()),
    "LINE": new LineEditMode(getEditorData()),
    "BOX": new BoxEditMode(getEditorData()),
    "ELLIPSE": new EllipseEditMode(getEditorData())
  });
  
  const [editMode, setEditMode] = useState<EditorEditMode>("DRAW");

  function drawCell(context: CanvasRenderingContext2D, view: View, row: number, col: number) {
    const canvasPosition = worldToCanvas(new Vector2(row, col))
    context.fillRect(canvasPosition.col, canvasPosition.row, view.cellSize, view.cellSize);
  }

  function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View, map: GameMap): void {
    context.save();

    map.forEachTileLocation((tile, row, col) => {
      const location = new Vector2(row, col)
      const screenLocation = worldToCanvas(location)
      if (screenLocation.row >= 0 && location.col >= 0 && location.row <= canvas.width && location.col <= canvas.height) {
        context.fillStyle = rgbaToString(tile.color)
        drawCell(context, view, row, col)
      }
    })


    // for (let row = 0; row < canvas.height / view.cellSize; row++) {
    //   for (let col = 0; col < canvas.width / view.cellSize; col++) {

    //     const targetPosition: IVector2 = { row: Math.floor(view.row + row), col: Math.floor(view.col + col) } ;
    //     if (inDimensionBounds(targetPosition, map.dimensions)) {
    //       context.fillStyle = rgbaToString(map.tiles[targetPosition.row][targetPosition.col].color);
    //       context.globalAlpha = map.tiles[targetPosition.row][targetPosition.col].color.alpha / 255;
    //       const offset: IVector2 = getViewOffset(view);
    //       context.fillRect(-offset.col + col * view.cellSize, -offset.row + row * view.cellSize, view.cellSize, view.cellSize);
    //     }

    //   }

    // }

    // context.fill();

    context.restore();
  }

  function renderGhostTiles(context: CanvasRenderingContext2D, view: View, ghostTilePositions: IVector2[], selectedTile: Tile) {
    if (ghostTilePositions.length === 0) return;
    context.save();
    context.globalAlpha = 0.5;
    context.fillStyle = rgbaToString(selectedTile.color);
    ghostTilePositions.forEach(pos => drawCell(context, view, pos.row, pos.col))
    context.restore();
  }

  function renderGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View) {
    context.save();
    context.strokeStyle = 'black';
    context.beginPath()
     const viewOffset: IVector2 = getViewOffset(view);
    for (let y = -viewOffset.row; y <= canvas.height; y += view.cellSize) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    
    for (let x = -viewOffset.col; x <= canvas.width; x += view.cellSize) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }

    context.stroke();
    context.restore();
  }

  function clearScreen(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawCurrentHoveredCellShadow(context: CanvasRenderingContext2D) {
    context.globalAlpha = 0.5;
    context.fillStyle = map.inBoundsVec2(lastHoveredCell.current) ? 'blue' : 'red';
    drawCell(context, view, currentHoveredCell.current.row, currentHoveredCell.current.col);
    context.globalAlpha = 1;
  }



  function render() {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas === null || canvas === undefined) return;
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (context === null || context === undefined) return;

    clearScreen(canvas, context)
    renderWalls(canvas, context, view, map);
    renderGrid(canvas, context, view);
    renderGhostTiles(context, view, ghostTilePositions, selectedTile);
    drawCurrentHoveredCellShadow(context)
  }

  function updateHoveredCellData(event: PointerEvent<Element>) {
    lastHoveredCell.current = currentHoveredCell.current
    currentHoveredCell.current = getHoveredCell(event)
  }

  function onPointerMove(event: PointerEvent<Element>) {
    updateHoveredCellData(event)
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData()).onPointerMove?.(event)
    render();
  }
  
  function onPointerDown(event: PointerEvent<Element>) {
    isPointerDown.current = true;
    updateHoveredCellData(event)
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData()).onPointerDown?.(event)
    render()
  }
  
  function onPointerUp(event: PointerEvent<Element>) {
    updateHoveredCellData(event)
    isPointerDown.current = false;
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData()).onPointerUp?.(event)
    render()
  }

  function onPointerLeave(event: PointerEvent<Element>) {
    updateHoveredCellData(event)
    isPointerDown.current = false;
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData()).onPointerLeave?.(event)
    render()
  }

  function clear() {
    setMap(GameMap.filledEdges(map.name, map.dimensions))
  }
  
  
    const [undo, redo] = useHistory(mapData, areGameMapsEqual);
  function onKeyDown(event: KeyboardEvent<Element>) {
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData())
    editorModes.current[editMode].onKeyDown?.(event);

    if (event.code === "KeyZ" && event.shiftKey === true && event.ctrlKey === true) {
      redo();
    } else if (event.code === "KeyZ" && event.ctrlKey === true) {
      undo();
    } else if (event.code === "KeyC") {
      center()
    } else if (event.code === "KeyF") {
      fit()
      center()
    }

    render()
  }

  function onKeyUp(event: KeyboardEvent<Element>) {
    editorModes.current[editMode].sendUpdatedEditorData(getEditorData())
    editorModes.current[editMode].onKeyUp?.(event);
    render()
  }
  
  useEffect(render)
  
  useEffect(() => {
    setCursor(editorModes.current[editMode].cursor())
  }, [editMode])

  useCanvasHolderUpdater(canvasRef, canvasHolderRef, render);
    
  useEffect(() => {
      fit();
      center();
  }, [])

  const [newMapDimension, setNewMapDimension] = useState<IDimension2D>({width: 10, height: 10});
  function onMapGenerate() {
    setMap(GameMap.filledEdges("Generated Map", newMapDimension) )
    const desiredCameraPosition = new Vector2(camera.position.row / map.dimensions.height * newMapDimension.height, camera.position.col / map.dimensions.width * newMapDimension.width)
    setCamera(camera => camera.place(tryPlaceCamera(camera, map, desiredCameraPosition)))
  }


  function onTileCreatorTextureImport(e: ChangeEvent<HTMLInputElement>) {

  }

  function EditModeButton({ children = "", editMode: buttonEditMode }: { children?: React.ReactNode, editMode: EditorEditMode } ) {
    return <button className={`${mapEditorStyles["edit-button"]} ${ editMode === buttonEditMode ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(buttonEditMode)}>{ children}</button>
  }

  return (

    <div className={mapEditorStyles["master-container"]}>

      <main className={mapEditorStyles["editor-container"]}>

        <div className={mapEditorStyles["tool-bar"]}>
          <div className={mapEditorStyles["editing-buttons"]}> 
            <EditModeButton editMode="DRAW"> <FaBrush /> </EditModeButton>
            <EditModeButton editMode="MOVE"> <FaArrowsAlt /> </EditModeButton>
            <EditModeButton editMode="ZOOM"> <FaSearch /> </EditModeButton>
            <EditModeButton editMode="ERASE"> <FaEraser /> </EditModeButton>
            <EditModeButton editMode="LINE"> <GiStraightPipe /> </EditModeButton>
            <EditModeButton editMode="BOX"> <FaBox /> </EditModeButton>
            <EditModeButton editMode="ELLIPSE"> <BsCircle /> </EditModeButton>
            {/* <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoBack() === false ? mapEditorStyles["disabled"] : '' }`} onClick={undo}> <FaUndo /> </button>
            <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoForward() === false ? mapEditorStyles["disabled"] : '' }`} onClick={redo}> <FaRedo /> </button> */}
          </div>
        </div>

        <aside className={mapEditorStyles["left-side-bar"]}>

          <div className={mapEditorStyles["tool-area"]}>
            <p className={mapEditorStyles["tool-title"]}> Tile Picker </p>
            <div className={mapEditorStyles["selected-tiles"]}>
              { Object.keys(savedTiles).map(tileName => <button className={`${mapEditorStyles["saved-tile-selection-button"]} ${areEqualTiles(selectedTile, savedTiles[tileName]) ? mapEditorStyles["selected"] : mapEditorStyles["unselected"]}`} key={`tile: ${tileName}`} onClick={() => setSelectedTile(savedTiles[tileName])}> {tileName}</button>)}
            </div>
          </div>

          <div className={mapEditorStyles["tile-creator"]}>

            <h3> Tile Creator </h3>
            
            <div className={mapEditorStyles["tile-creator-color-picker"]}>
              Color
              <input type="range" min={0} max={255} />
              <input type="range" min={0} max={255} />
              <input type="range" min={0} max={255} />
              { /* <input type="range" min={0} max={255} /> Alpha not really supported to be honest, so will hide for now */ }
            </div>

            <button> Can Hit </button> 
            <button> Can Collide </button>
            <input type="file" onChange={onTileCreatorTextureImport} />
            <button> Preview </button>

            <button> Create </button>

          </div>

        </aside>

        <aside className={mapEditorStyles["right-side-bar"]}>

          <div className={mapEditorStyles["tool-area"]}>

            <p className={mapEditorStyles["tool-title"]}> Map Generator </p>

            <div className={mapEditorStyles["map-dimensions-input-area"]}>
              <section className={mapEditorStyles["map-dimensions-input-field"]}>
                <p className={mapEditorStyles["map-dimensions-input-label"]}> Width: </p>
                <input className={mapEditorStyles["map-dimensions-input"]} type="number" min={4} onChange={(e) => setNewMapDimension(({...newMapDimension, width: e.target.valueAsNumber }))} value={newMapDimension.width} />
              </section>

              <section className={mapEditorStyles["map-dimensions-input-field"]}>
                <p className={mapEditorStyles["map-dimensions-input-label"]}> Height: </p>
                <input className={mapEditorStyles["map-dimensions-input"]} type="number" min={4} onChange={(e) => setNewMapDimension({ ...newMapDimension, height: e.target.valueAsNumber })} value={newMapDimension.height} />
              </section>
            </div>

            <button className={mapEditorStyles['map-generate-button']} onClick={onMapGenerate}> Generate {newMapDimension.width} x {newMapDimension.height} Empty Map </button>

          </div>
          
          <div className={mapEditorStyles["tool-area"]}>
            <p className={mapEditorStyles["tool-title"]}> Actions </p>
            <div className={mapEditorStyles["action-buttons"]}>
              <button className={mapEditorStyles["action-button"]} onClick={() => { fit(); center(); }}>{"Fit Map (F)"}</button>
              <button className={mapEditorStyles["action-button"]} onClick={center}>{"Center Map (c)"}</button>
              <button className={mapEditorStyles["action-button"]} onClick={clear}>{"Clear"}</button>
            </div>
          </div>


        </aside>

        <div className={mapEditorStyles["main-view"]}>
          <div className={mapEditorStyles["editing-canvas-holder"]} ref={canvasHolderRef}>
              <canvas style={{cursor: cursor}} className={mapEditorStyles["editing-canvas"]} ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>
          </div>
          {/* <GameScreen cameraData={cameraData} mapData={mapData} /> */}
        </div>

      </main>

    </div>

  )
}