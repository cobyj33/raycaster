import { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback } from 'react'
import { getFillerTile, vector2Int, StatefulData, IVector2, View, GameMap, getFilledMapEdges, getDefaultTile, Tile, gameMapInBounds, areGameMapsEqual, getEmptyMap, tryPlaceCamera, Camera, areEqualTiles, Vector2, subtractVector2, getViewOffset, inDimensionBounds, rgbaToString } from "raycaster/interfaces";
import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaLine, FaBox, FaEllipsisH, FaUndo, FaRedo, FaHammer } from "react-icons/fa"
import { EditMode, EditorData, MoveEditMode, ZoomEditMode, DrawEditMode, EraseEditMode, LineEditMode, BoxEditMode, EllipseEditMode } from "raycaster/editor"
import { HistoryStack } from "raycaster/structures";
import { useHistory, useWindowEvent, useResizeObserver, getCanvasAndContext } from "raycaster/functions";
import mapEditorStyles from "components/styles/MapEditor.module.css"
import { SketchPicker } from "react-color"
import { TileCreator } from 'components/TileCreator';



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

  function pointerPositionInCanvas(event: PointerEvent<Element>): Vector2 {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (canvas !== null && canvas !== undefined) {
          const canvasBounds: DOMRect = canvas.getBoundingClientRect();
          return new Vector2(Math.trunc(event.clientY - canvasBounds.y), Math.trunc(event.clientX - canvasBounds.x))
      }
      return Vector2.ZERO
  }

  function canvasToWorld(canvasPosition: IVector2): Vector2 {
    return new Vector2(canvasPosition.row / view.cellSize - view.row, canvasPosition.col / view.cellSize - view.col)
  }

  function worldToCanvas(worldPosition: IVector2): Vector2 {
      return new Vector2((view.row + worldPosition.row) * view.cellSize, (view.col + worldPosition.col) * view.cellSize)
  }

function focus(worldPosition: IVector2) {
    setView(view => { 
        try {
            const [canvas, _] = getCanvasAndContext(canvasRef)
            const worldViewportCenter = new Vector2(canvas.height, canvas.width).scale(1/view.cellSize).scale(1/2)
            const viewPosition = subtractVector2(Vector2.fromIVector2(worldPosition).scale(-1), worldViewportCenter.scale(-1))
            return {...view, ...viewPosition }
        } catch (error) {
            return {...view}
        }
    })
}

  function center(): void {
    setView(view => { 
      try {
          const [canvas, _] = getCanvasAndContext(canvasRef)
          const mapCenter: IVector2 = { row: map.dimensions.row / 2, col: map.dimensions.col / 2 }
          const startingCellSize: number =  Math.trunc( Math.min( canvas.height / map.dimensions.row, canvas.width / map.dimensions.col  ) ); 
          const startingCoordinates: IVector2 = {
              row: mapCenter.row - (canvas.height / view.cellSize / 2),
              col: mapCenter.col - (canvas.width / view.cellSize / 2)
          } 
          return {...view, ...startingCoordinates }
      } catch (error) {
          return {...view}
      }
    })
  }

  function fit(): void {
      setView(view => {
              try {
                  const [canvas, _] = getCanvasAndContext(canvasRef)
                  const dimensions = new Vector2(map.tiles.length, map.tiles[0].length)
                  const viewportSize = new Vector2(canvas.height, canvas.width)
                  const cellSize = Math.min(viewportSize.row / dimensions.row, viewportSize.col / dimensions.col)
                  // setView(view => ({...view, ...viewPosition}))
              return {...view, cellSize: cellSize }
              } catch (error) {
                  return {...view}
              }
          })
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

  function drawCell(context: CanvasRenderingContext2D, view: View, row: number, col: number) {
    context.fillRect((col - view.col) * view.cellSize, (row - view.row) * view.cellSize, view.cellSize, view.cellSize  );
  }

  function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View, map: GameMap): void {
    context.save();
    for (let row = 0; row < canvas.height / view.cellSize; row++) {
      for (let col = 0; col < canvas.width / view.cellSize; col++) {

        const targetPosition: IVector2 = { row: Math.floor(view.row + row), col: Math.floor(view.col + col) } ;
        if (inDimensionBounds(targetPosition, map.dimensions)) {
          context.fillStyle = rgbaToString(map.tiles[targetPosition.row][targetPosition.col].color);
          context.globalAlpha = map.tiles[targetPosition.row][targetPosition.col].color.alpha / 255;
            const offset: IVector2 = getViewOffset(view);
          context.fillRect(-offset.col + col * view.cellSize, -offset.row + row * view.cellSize, view.cellSize, view.cellSize);
        }

      }
    }

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
    } else if (event.code === "KeyC") {
      center()
    } else if (event.code === "KeyF") {
      fit()
      center()
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

        // const mapCenter: IVector2 = { row: map.dimensions.row / 2, col: map.dimensions.col / 2 }
        // const adjustedCoordinates: IVector2 = vector2Int({ 
        //     row: mapCenter.row - (canvas.height / view.cellSize / 2),
        //     col: mapCenter.col - (canvas.width / view.cellSize / 2)
        // })

        // setView(view => ({...view, ...adjustedCoordinates}));
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

  function onMapGenerate() {
    setMap(getFilledMapEdges(getEmptyMap(newMapDimension), getDefaultTile("Wall Tile")))
    setCamera( (camera: Camera) => ({...camera, position: tryPlaceCamera(camera, {
      row: camera.position.row / map.dimensions.row * newMapDimension.row,
      col: camera.position.col / map.dimensions.col * newMapDimension.col
    })}) )
  }

  const [newMapDimension, setNewMapDimension] = useState<IVector2>({row: 10, col: 10});
  
  return (
    <div className={mapEditorStyles["editor-container"]}>
      <div className={mapEditorStyles["editing-buttons"]}> 
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.DRAW ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.DRAW)}> <FaBrush /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.MOVE ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.MOVE)}> <FaArrowsAlt /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.ZOOM ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.ZOOM)}> <FaSearch /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.ERASE ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.ERASE)}> <FaEraser /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.LINE ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.LINE)}> <FaLine /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.BOX ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.BOX)}> <FaBox /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ editMode === EditorEditMode.ELLIPSE ? mapEditorStyles["selected"] : '' }`} onClick={() => setEditMode(EditorEditMode.ELLIPSE)}> <FaEllipsisH /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoBack() === false ? mapEditorStyles["disabled"] : '' }`} onClick={undo}> <FaUndo /> </button>
        <button className={`${mapEditorStyles["edit-button"]} ${ mapHistory.current.canGoForward() === false ? mapEditorStyles["disabled"] : '' }`} onClick={redo}> <FaRedo /> </button>
      </div>

      <div className={mapEditorStyles["tile-picker"]}>
        { Object.keys(savedTiles).map(tileName => <button className={`${mapEditorStyles["saved-tile-selection-button"]} ${areEqualTiles(selectedTile, savedTiles[tileName]) ? mapEditorStyles["selected"] : mapEditorStyles["unselected"]}`} key={`tile: ${tileName}`} onClick={() => setSelectedTile(savedTiles[tileName])}> {tileName}</button>)}
      </div>

      <div className={mapEditorStyles["editing-canvas-holder"]} ref={canvasHolderRef}>
          <canvas style={{cursor: cursor}} className={mapEditorStyles["editing-canvas"]} ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>
      </div>

      {/* <div className={`tile-creator-container ${tileCreatorOpened ? 'opened' : ''}`}>
        <button className='editor-tile-creator-open-button' onClick={() => setTileCreatorOpened(!tileCreatorOpened)}> <FaHammer /> </button>
          <TileCreator className={`editor-tile-creator`} tileData={tileData} />
      </div> */}

      <div className={mapEditorStyles["map-generator"]}>
        <div className={mapEditorStyles["map-dimensions-input"]}>
          <p> Rows: </p>
          <input type="number" min={4} onChange={(e) => setNewMapDimension(({...newMapDimension, row: e.target.valueAsNumber }))} value={newMapDimension.row} />
          <p> Cols: </p>
          <input type="number" min={4} onChange={(e) => setNewMapDimension({ ...newMapDimension, col: e.target.valueAsNumber })} value={newMapDimension.col} />
        </div>

      <button className={mapEditorStyles['map-generate-button']} onClick={onMapGenerate}> Generate {newMapDimension.row} x {newMapDimension.col} Map </button>
      </div>

    </div>
  )
}