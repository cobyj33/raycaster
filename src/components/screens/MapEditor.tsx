import { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback } from 'react'
import { vector2Int, StatefulData, IVector2, View, GameMap, getFilledMapEdges, getDefaultTile, Tile, gameMapInBounds, areGameMapsEqual, getEmptyMap, tryPlaceCamera, Camera, areEqualTiles } from "raycaster/interfaces";
import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaLine, FaBox, FaEllipsisH, FaUndo, FaRedo, FaHammer } from "react-icons/fa"
import { EditMode, EditorData, MoveEditMode, ZoomEditMode, DrawEditMode, EraseEditMode, LineEditMode, BoxEditMode, EllipseEditMode } from "raycaster/editor"
import { TileCreator } from "raycaster/components";
import { HistoryStack } from "raycaster/structures";
import { drawCell, renderGhostTiles, renderWalls, renderGrid, useHistory, useWindowEvent, useResizeObserver } from "raycaster/functions";
import "components/styles/mapeditor.css"


export const MapEditor = ( { cameraData, mapData, tileData }: { cameraData: StatefulData<Camera>, mapData: StatefulData<GameMap>, tileData: StatefulData<{[key: string]: Tile}> }) => {
  enum EditorEditMode { MOVE = "Move", ZOOM = "Zoom", DRAW = "Draw", ERASE = "Erase", LINE = "Line", BOX = "Box", ELLIPSE = "Ellipse" }
  const mapHistory = useRef<HistoryStack<GameMap>>(new HistoryStack<GameMap>());
  const [camera, setCamera] = cameraData;
  const [map, setMap] = mapData;
  const [savedTiles] = tileData;
  const [selectedTile, setSelectedTile] = useState<Tile>(getDefaultTile("Wall Tile"));
  const [ghostTilePositions, setGhostTilePositions] = useState<IVector2[]>([]);
  const [cursor, setCursor] = useState<string>('crosshair');
    const [view, setView] = useState<View>({
        row: 0,
        col: 0,
        cellSize: 10
    });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const lastHoveredCell: MutableRefObject<IVector2> = useRef<IVector2>({
      row: 0,
      col: 0
  });
  const isPointerDown: MutableRefObject<boolean> = useRef<boolean>(false);

  const [tileCreatorOpened, setTileCreatorOpened] = useState<boolean>(false);

    const pointerPositionInCanvas = (event: PointerEvent<Element>): IVector2 => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
            return {
                row: Math.trunc(event.clientY - canvasBounds.y),
                col: Math.trunc(event.clientX - canvasBounds.x)
            }
        }
        return { row: 0, col: 0  };
      }


  const getHoveredCell = (event: PointerEvent<Element>) => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const pointerPosition: IVector2 = pointerPositionInCanvas(event);
      return {
          row: Math.trunc((pointerPosition.row / view.cellSize) + view.row),
          col: Math.trunc((pointerPosition.col / view.cellSize) + view.col)
      }
    }
    return { row: 0, col: 0 };
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

  // const centerView: (position: IVector2) => void = (position: IVector2) => {
  //   const canvas: HTMLCanvasElement | null = canvasRef.current;
  //   if (canvas !== null && canvas !== undefined) {
  //     // setView( view.withCoordinates( new IVector2(position.row - (canvas.width / view.cellSize), position.col - (canvas.height / view.cellSize)) )  )
  //       setView( view => ({...view, ...{ row: position.row - (canvas.width / view.cellSize), col: position.col - (canvas.height / view.cellSize)  }   }) )
  //   }
  // }


  function render() {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas === null || canvas === undefined) return;
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (context === null || context === undefined) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    renderWalls(canvas, context, view, map);
    renderGrid(canvas, context, view);
    renderGhostTiles(context, view, ghostTilePositions, selectedTile);


    context.globalAlpha = 0.5;
    context.fillStyle = gameMapInBounds(map, lastHoveredCell.current.row, lastHoveredCell.current.col) ? 'blue' : 'red';
    drawCell(context, view, lastHoveredCell.current.row + 1, lastHoveredCell.current.col + 1);
    context.globalAlpha = 1;
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
  
  
    const [undo, redo] = useHistory(mapData, areGameMapsEqual);
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

  // useEffect(() => {
  //   if (mapHistory.current.empty === false) {
  //     if ( areGameMapsEqual(mapHistory.current.peek().equals(map) === false) {
  //       mapHistory.current.pushState(map);
  //     }
  //   } else {
  //     mapHistory.current.pushState(map);
  //   }
  // }, [map])

  // function undo() {
  //   console.log(mapHistory.current.length);
  //   console.log(mapHistory.current.canGoBack());
  //   if (mapHistory.current.canGoBack()) {
  //     mapHistory.current.back();
  //     setMap(mapHistory.current.state);
  //   }
  // }

  // function redo() {
  //   console.log(mapHistory.current.length);
  //   if (mapHistory.current.canGoForward()) {
  //     mapHistory.current.forward();
  //     setMap(mapHistory.current.state);
  //   }
  // }
    
    //TODO: CHECK DEPENDENCIES IN THIS USE EFFECT

    const updateCanvasSize = useCallback(() => {
      const canvas = canvasRef.current
      const canvasHolder = canvasHolderRef.current
      if (canvas !== null && canvas !== undefined && canvasHolder !== null && canvasHolder !== undefined) {
        const rect: DOMRect = canvasHolder.getBoundingClientRect();
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

        const mapCenter: IVector2 = { row: map.dimensions.row / 2, col: map.dimensions.col / 2 }
        const adjustedCoordinates: IVector2 = vector2Int({ 
            row: mapCenter.row - (canvas.height / view.cellSize / 2),
            col: mapCenter.col - (canvas.width / view.cellSize / 2)
        })

        setView(view => ({...view, ...adjustedCoordinates}));
      }
    }, [map, view])

    useWindowEvent('resize', updateCanvasSize, [map, view]);
    useResizeObserver(canvasHolderRef, updateCanvasSize);
    
  useEffect(() => {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas === null || canvas === undefined) return;

      updateCanvasSize();
        const mapCenter: IVector2 = { row: map.dimensions.row / 2, col: map.dimensions.col / 2 }
        const startingCellSize: number =  Math.trunc( Math.min( canvas.height / map.dimensions.row, canvas.width / map.dimensions.col  ) ); 
        const startingCoordinates: IVector2 = {
            row: mapCenter.row - (canvas.height / view.cellSize / 2),
            col: mapCenter.col - (canvas.width / view.cellSize / 2)
        } 

        setView({ cellSize: startingCellSize, ...startingCoordinates });
  }, [])

  const [newMapDimension, setNewMapDimension] = useState<IVector2>({row: 10, col: 10});
  
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
        { Object.keys(savedTiles).map(tileName => <button className={`saved-tile-selection-button ${areEqualTiles(selectedTile, savedTiles[tileName]) ? "selected" : "unselected"}`} key={`tile: ${tileName}`} onClick={() => setSelectedTile(savedTiles[tileName])}> {tileName}</button>)}
      </div>

      <div className="editing-canvas-holder" ref={canvasHolderRef}>
          <canvas style={{cursor: cursor}} className="editing-canvas" ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>
      </div>

      <div className={`tile-creator-container ${tileCreatorOpened ? 'opened' : ''}`}>
        <button className='editor-tile-creator-open-button' onClick={() => setTileCreatorOpened(!tileCreatorOpened)}> <FaHammer /> </button>
          <TileCreator className={`editor-tile-creator`} tileData={tileData} />
      </div>

      <div className="map-generator">
        <div className="map-dimensions-input">
      <p> Rows: </p>
          <input type="number" min={4} onChange={(e) => setNewMapDimension(({...newMapDimension, row: e.target.valueAsNumber }))} value={newMapDimension.row} />
      <p> Cols: </p>
          <input type="number" min={4} onChange={(e) => setNewMapDimension({ ...newMapDimension, col: e.target.valueAsNumber })} value={newMapDimension.col} />
        </div>

      <button className='map-generate-button' onClick={() => {
            setMap(getFilledMapEdges(getEmptyMap(newMapDimension), getDefaultTile("Wall Tile")))
          setCamera( (camera: Camera) => ({...camera, position: tryPlaceCamera(camera, {
              row: camera.position.row / map.dimensions.row * newMapDimension.row,
              col: camera.position.col / map.dimensions.col * newMapDimension.col
          })}) )
      }}> Generate {newMapDimension.row} x {newMapDimension.col} Map </button>
      </div>

    </div>
  )
}
