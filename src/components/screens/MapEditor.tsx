import React, { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback, ChangeEvent, RefObject } from 'react'

import { StatefulData } from 'interfaces/util';
import { IVector2, Vector2 } from 'interfaces/Vector2';
import { View, getViewOffset } from 'interfaces/View';
import { GameMap, areGameMapsEqual } from 'interfaces/GameMap';
import { Camera, tryPlaceCamera } from "interfaces/Camera"
import { Tile, getDefaultTile, areEqualTiles } from "interfaces/Tile" 
import { inDimensionBounds } from 'interfaces/Ray';
import { rgbaToString } from 'interfaces/Color';
import { RGBA } from 'interfaces/Color';
import { useHistory, useWindowEvent, useResizeObserver, useCanvasHolderUpdater } from 'functions/hooks';
import { getCanvasAndContext2D, withCanvasAndContext, withCanvasAndContextSaved } from 'functions/util';

import { EditMode, EditorData, MoveEditMode, ZoomEditMode, DrawEditMode, EraseEditMode, LineEditMode, BoxEditMode, EllipseEditMode } from "classes/Editor"
import { HistoryStack } from "classes/Structures/HistoryStack";

import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaBox } from "react-icons/fa"
import { GiStraightPipe } from "react-icons/gi"
import { BsCircle } from 'react-icons/bs'

import mapEditorStyles from "components/styles/MapEditor.module.css"
import { GameScreen } from './GameScreen';
import { Dimension2D, IDimension2D } from 'jsutil';
import EditorActionButton from 'components/editor/common/EditorActionButton';
import MapGenerator from 'components/editor/tools/MapGenerator';
import MapEditorSideTool from 'components/editor/common/MapEditorSideTool';
import TileCreator from 'components/editor/tools/TileCreator';
import TilePicker from 'components/editor/tools/TilePicker';
import EditModeButton from 'components/editor/common/EditModeButton';

export type EditorEditMode = "MOVE" | "ZOOM" | "DRAW" | "ERASE" | "LINE" | "BOX" | "ELLIPSE"

const TILE_PREVIEW_MAP_DIMENSION_SIZE = new Dimension2D(10, 10)
const TILE_PREVIEW_START_POSITION = new Vector2(2, 5)
const TILE_PREVIEW_START_DIRECTION = Vector2.EAST

export const MapEditor = ( { cameraData, mapData, tileData }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap>, tileData: StatefulData<{[key: string]: Tile}> }) => {
  const mapHistory = useRef<HistoryStack<GameMap>>(new HistoryStack<GameMap>());

  const [camera, setCamera] = cameraData;
  const [map, setMap] = mapData;
  const [savedTiles, setSavedTiles] = tileData;
  const [selectedTile, setSelectedTile] = useState<Tile>(getDefaultTile("Wall Tile"));

  const [ghostTilePositions, setGhostTilePositions] = useState<IVector2[]>([]);

  const [cursor, setCursor] = useState<string>('crosshair');
  const [view, setView] = useState<View>(new View(Vector2.ZERO, 10));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const lastHoveredCell: MutableRefObject<IVector2> = useRef<Vector2>(Vector2.ZERO);
  const currentHoveredCell: MutableRefObject<IVector2> = useRef<Vector2>(Vector2.ZERO)

  const isPointerDown: MutableRefObject<boolean> = useRef<boolean>(false);
  
  // Tile Creator
  const [previewingTileCreator, setPreviewingTileCreator] = useState<boolean>(false);
  const [previewTile, setPreviewTile] = useState<Tile>(getDefaultTile("Wall Tile"))
  const [previewMap, setPreviewMap] = useState<GameMap>(GameMap.filledEdges("Preview Map", new Dimension2D(9, 9)))
  const [previewCamera, setPreviewCamera] = useState<Camera>(Camera.default().place(previewMap.center.subtract(new Vector2(2, 0))).face( Vector2.EAST )  )

  useEffect(() => {
    setPreviewMap(previewMap => previewMap.setVec2(previewMap.center.trunc(), previewTile))
  }, [previewTile])

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

  // function focus(worldPosition: IVector2) {
  //     setView(view => {
  //         let newView = view;
  //         withCanvasAndContext(canvasRef, (canvas, context) => {
  //           const worldViewportCenter = new Vector2(canvas.height, canvas.width).scale(1/view.cellSize).scale(1/2)
  //           const viewPosition = Vector2.fromIVector2(worldPosition).scale(-1).subtract(worldViewportCenter.scale(-1))
  //           newView = view.withPosition(viewPosition)
  //         })
  //         return newView
  //     })
  // }

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

  function onMapGenerate(newMapDimension: IDimension2D) {
    setMap(GameMap.filledEdges("Generated Map", newMapDimension) )
    const desiredCameraPosition = new Vector2(camera.position.row / map.dimensions.height * newMapDimension.height, camera.position.col / map.dimensions.width * newMapDimension.width)
    setCamera(camera => camera.place(tryPlaceCamera(camera, map, desiredCameraPosition)))
  }




  return (

    <div className={mapEditorStyles["master-container"]}>

      <main className={mapEditorStyles["editor-container"]}>

        <div className={mapEditorStyles["tool-bar"]}>
          <div className={mapEditorStyles["editing-buttons"]}> 
            <EditModeButton target="DRAW" current={editMode} setter={setEditMode}> <FaBrush /> </EditModeButton>
            <EditModeButton target="MOVE" current={editMode} setter={setEditMode}> <FaArrowsAlt /> </EditModeButton>
            <EditModeButton target="ZOOM" current={editMode} setter={setEditMode}> <FaSearch /> </EditModeButton>
            <EditModeButton target="ERASE" current={editMode} setter={setEditMode}> <FaEraser /> </EditModeButton>
            <EditModeButton target="LINE" current={editMode} setter={setEditMode}> <GiStraightPipe /> </EditModeButton>
            <EditModeButton target="BOX" current={editMode} setter={setEditMode}> <FaBox /> </EditModeButton>
            <EditModeButton target="ELLIPSE" current={editMode} setter={setEditMode}> <BsCircle /> </EditModeButton>
            {/* <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoBack() === false ? mapEditorStyles["disabled"] : '' }`} onClick={undo}> <FaUndo /> </button>
            <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoForward() === false ? mapEditorStyles["disabled"] : '' }`} onClick={redo}> <FaRedo /> </button> */}
          </div>
        </div>

        <aside className={mapEditorStyles["left-side-bar"]}>
          <TilePicker onTileSelect={(tile) => setSelectedTile(tile)} selectedTile={selectedTile} tiles={savedTiles} />
          <TileCreator onSubmit={(tile, name) => setSavedTiles({...savedTiles, [name]: tile })} onTileChange={(tile) => setPreviewTile(tile)} previewData={[previewingTileCreator, setPreviewingTileCreator]} />
        </aside>

        <aside className={mapEditorStyles["right-side-bar"]}>
          <MapGenerator onMapGenerate={onMapGenerate} />

          <MapEditorSideTool title="Actions">
            <div className={mapEditorStyles["action-buttons"]}>
              <EditorActionButton onClick={() => { fit(); center(); }}>{"Fit Map (F)"}</EditorActionButton>
              <EditorActionButton onClick={center}>{"Center Map (c)"}</EditorActionButton>
              <EditorActionButton onClick={clear}>{"Clear"}</EditorActionButton>
            </div>
          </MapEditorSideTool>
        </aside>

        <div className={mapEditorStyles["main-view"]}>
          { previewingTileCreator ? <GameScreen cameraData={[previewCamera, setPreviewCamera]} mapData={[previewMap, setPreviewMap]} moveSpeed={0.05} /> : 
          <div className={mapEditorStyles["editing-canvas-holder"]} ref={canvasHolderRef}>
              <canvas style={{cursor: cursor}} className={mapEditorStyles["editing-canvas"]} ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>
          </div> }
          {/* <GameScreen cameraData={cameraData} mapData={mapData} /> */}
        </div>

      </main>

    </div>
  )
}