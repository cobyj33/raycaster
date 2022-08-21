import { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback } from 'react'
import { Vector2 } from '../classes/Data/Vector2';
import { View } from '../classes/Data/View';
import { EditMode } from '../classes/Editor/EditMode';
import { MoveEditMode } from '../classes/Editor/MoveEditMode';
import { ZoomEditMode } from '../classes/Editor/ZoomEditMode';
import { GameMap } from '../classes/GameMap'
import { WallTile } from '../classes/Tiles/WallTile';
import { StatefulData } from '../interfaces/StatefulData'
import "./styles/mapeditor.scss"
import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaLine, FaBox, FaEllipsisH, FaUndo, FaRedo, FaHammer } from "react-icons/fa"
import { EditorData } from '../classes/Editor/EditorData';
import { EraseEditMode } from '../classes/Editor/EraseEditMode';
import { DrawEditMode } from '../classes/Editor/DrawEditMode';
import { LineEditMode } from '../classes/Editor/LineEditMode';
import { BoxEditMode } from '../classes/Editor/BoxEditMode';
import { TileCreator } from './TileCreator';
import { Tile } from '../interfaces/Tile';
import { EllipseEditMode } from '../classes/Editor/EllipseEditMode';
import { KeyHandler, useKeyHandler } from '../classes/KeySystem/KeyHandler';
import { KeyBinding } from '../classes/KeySystem/KeyBinding';
import { HistoryStack } from '../classes/Structures/HistoryStack';
import { Dimension } from '../classes/Data/Dimension';
import { drawCell, renderGhostTiles, renderWalls, renderGrid } from '../functions/boardRenderingFunctions';


export const MapEditor = ( { mapData, tileData }: { mapData: StatefulData<GameMap>, tileData: StatefulData<Tile[]> }) => {
  enum EditorEditMode { MOVE = "Move", ZOOM = "Zoom", DRAW = "Draw", ERASE = "Erase", LINE = "Line", BOX = "Box", ELLIPSE = "Ellipse" }
  const mapHistory = useRef<HistoryStack<GameMap>>(new HistoryStack<GameMap>());
  const [map, setMap] = mapData;
  const [savedTiles, setSavedTiles] = tileData;
  const [selectedTile, setSelectedTile] = useState<Tile>(new WallTile());
  const [ghostTilePositions, setGhostTilePositions] = useState<Vector2[]>([]);
  const [cursor, setCursor] = useState<string>('crosshair');
  const [view, setView] = useState<View>(new View(new Vector2(0, 0), 10));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHoveredCell: MutableRefObject<Vector2> = useRef<Vector2>(new Vector2(0, 0));
  const isPointerDown: MutableRefObject<boolean> = useRef<boolean>(false);

  const [tileCreatorOpened, setTileCreatorOpened] = useState<boolean>(false);

  const pointerPositionInCanvas = (event: PointerEvent<Element>): Vector2 => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const canvasBounds: DOMRect = canvas.getBoundingClientRect();
      return new Vector2(event.clientY - canvasBounds.y, event.clientX - canvasBounds.x).int();
    }
    return new Vector2(0, 0);
  }
  const getHoveredCell = (event: PointerEvent<Element>) => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const pointerPosition: Vector2 = pointerPositionInCanvas(event);
      return new Vector2( (pointerPosition.row / view.cellSize) + view.coordinates.row, (pointerPosition.col / view.cellSize) + view.coordinates.col ).int()
    }
    return Vector2.zero.clone();
  }
  
  const getEditorData: () => EditorData = () => {
    return {
      lastHoveredCell: lastHoveredCell.current,
      isPointerDown: isPointerDown.current,
      mapData: mapData,
      viewData: [view, setView],
      getHoveredCell: getHoveredCell,
      selectedTile: selectedTile,
      ghostTilePositions: [ghostTilePositions, setGhostTilePositions]
    }
  }
  
  const editorModes: MutableRefObject<{[key in EditorEditMode]: EditMode}> = useRef({ 
    [EditorEditMode.DRAW]: new DrawEditMode(getEditorData()),
    [EditorEditMode.ZOOM]: new ZoomEditMode(getEditorData()),
    [EditorEditMode.MOVE]: new MoveEditMode(getEditorData()),
    [EditorEditMode.ERASE]: new EraseEditMode(getEditorData()),
    [EditorEditMode.LINE]: new LineEditMode(getEditorData()),
    [EditorEditMode.BOX]: new BoxEditMode(getEditorData()),
    [EditorEditMode.ELLIPSE]: new EllipseEditMode(getEditorData())
  });
  const [editMode, setEditMode] = useState<EditorEditMode>(EditorEditMode.DRAW);

  const center: (position: Vector2) => void = (position: Vector2) => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      setView( view.withCoordinates( new Vector2(position.row - (canvas.width / view.cellSize), position.col - (canvas.height / view.cellSize)) )  )
    }
  }


  function render() {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context !== null && context !== undefined) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        renderWalls(canvas, context, view, map);
        renderGrid(canvas, context, view);
        renderGhostTiles(context, view, ghostTilePositions, selectedTile);


        context.globalAlpha = 0.5;
        context.fillStyle = map.inBounds(lastHoveredCell.current.row, lastHoveredCell.current.col) ? 'blue' : 'red';
        drawCell(context, view, lastHoveredCell.current.row, lastHoveredCell.current.col);
        context.globalAlpha = 1;
      }
    }
  }

  function onPointerMove(event: PointerEvent<Element>) {
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onPointerMove?.(event);
    lastHoveredCell.current = getHoveredCell(event);
    render();
  }
  
  function onPointerDown(event: PointerEvent<Element>) {
    isPointerDown.current = true;
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onPointerDown?.(event);
    lastHoveredCell.current = getHoveredCell(event);
  }
  
  function onPointerUp(event: PointerEvent<Element>) {
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onPointerUp?.(event);
    isPointerDown.current = false;
  }

  function onPointerLeave(event: PointerEvent<Element>) {
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onPointerLeave?.(event);
    isPointerDown.current = false;
  }
  
  
  function onKeyDown(event: KeyboardEvent<Element>) {
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onKeyDown?.(event);

    if (event.code === "KeyZ" && event.shiftKey === true && event.ctrlKey === true) {
      redo();
    } else if (event.code === "KeyZ" && event.ctrlKey === true) {
      undo();
    }
  }

  function onKeyUp(event: KeyboardEvent<Element>) {
    editorModes.current[editMode].setEditorData(getEditorData())
    editorModes.current[editMode].onKeyUp?.(event);
  }
  
  useEffect(render)
  
  useEffect(() => {
    setCursor(editorModes.current[editMode].cursor())
  }, [editMode])
  
  useEffect(() => {
    if (mapHistory.current.empty === false) {
      if (mapHistory.current.peek().equals(map) === false) {
        mapHistory.current.pushState(map);
      }
    } else {
      mapHistory.current.pushState(map);
    }
  }, [map])

  function undo() {
    console.log(mapHistory.current.length);
    console.log(mapHistory.current.canGoBack());
    if (mapHistory.current.canGoBack()) {
      mapHistory.current.back();
      setMap(mapHistory.current.state);
    }
  }

  function redo() {
    console.log(mapHistory.current.length);
    if (mapHistory.current.canGoForward()) {
      mapHistory.current.forward();
      setMap(mapHistory.current.state);
    }
  }
    
  useEffect(() => {
    mapHistory.current.pushState(map);
    function updateCanvasSize() {
      if (canvasRef.current !== null && canvasRef.current !== undefined) {
        const canvas: HTMLCanvasElement = canvasRef.current;
        const rect: DOMRect = canvas.getBoundingClientRect();
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

        if (context !== null && context !== undefined) {
          const data = context.getImageData(0, 0, canvas.width, canvas.height);
          canvas.width = rect.width;
          canvas.height = rect.height;
          context.putImageData(data, 0, 0);
        } else {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
        setView(view => view.withCoordinates( new Vector2(map.center.row - (canvas.height / view.cellSize / 2), map.center.col - (canvas.width / view.cellSize / 2)).int() ));
      }
    }

    if (canvasRef.current !== null && canvasRef.current !== undefined) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      updateCanvasSize();
      setView(view => view.withCellSize( Math.trunc( Math.min( canvas.height / map.Dimensions.rows, canvas.width / map.Dimensions.cols  ) ) ))
      setView(view => view.withCoordinates( new Vector2(map.center.row - (canvas.height / view.cellSize / 2), map.center.col - (canvas.width / view.cellSize / 2)).int() ));
    }
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [])

  // useResizeObserver(canvasRef, updateCanvasSize)

  const [newMapDimension, setNewMapDimension] = useState<Dimension>(new Dimension(10, 10));
  
  return (
    <div className='editor-container screen'>
      <div className="editing-buttons"> 
        <button className={`edit-button ${ editMode === EditorEditMode.DRAW ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.DRAW)}> <FaBrush /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.MOVE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.MOVE)}> <FaArrowsAlt /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.ZOOM ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.ZOOM)}> <FaSearch /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.ERASE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.ERASE)}> <FaEraser /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.LINE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.LINE)}> <FaLine /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.BOX ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.BOX)}> <FaBox /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.ELLIPSE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.ELLIPSE)}> <FaEllipsisH /> </button>
        <button className={`edit-button ${ mapHistory.current.canGoBack() === false ? 'disabled' : '' }`} onClick={undo}> <FaUndo /> </button>
        <button className={`edit-button ${ mapHistory.current.canGoForward() === false ? 'disabled' : '' }`} onClick={redo}> <FaRedo /> </button>
      </div>

      <div className='side-bar'>

      </div>

      <div className="tile-picker">
        { savedTiles.map(tile => <button key={`tile: ${tile.name}`} onClick={() => setSelectedTile(tile)}> {tile.name}</button>)}
      </div>

      <canvas style={{cursor: cursor}} className="editing-canvas" ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>

      <div className={`tile-creator-container ${tileCreatorOpened ? 'opened' : ''}`}>
        <button className='editor-tile-creator-open-button' onClick={() => setTileCreatorOpened(!tileCreatorOpened)}> <FaHammer /> </button>
          <TileCreator className={`editor-tile-creator`} tileData={tileData} />
      </div>

      <div className="map-generator">
        <div className="map-dimensions-input">
          <input type="number" onChange={(e) => setNewMapDimension(new Dimension(e.target.valueAsNumber, newMapDimension.cols))} value={newMapDimension.rows} />
          <input type="number" onChange={(e) => setNewMapDimension(new Dimension(newMapDimension.rows, e.target.valueAsNumber))} value={newMapDimension.cols} />
        </div>

        <button className='map-generate-button' onClick={() => setMap(map => GameMap.filledEdges(newMapDimension))}> Generate </button>
      </div>

    </div>
  )
}
