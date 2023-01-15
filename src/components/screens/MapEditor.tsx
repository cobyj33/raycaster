import React, { useEffect, useRef, useState, MutableRefObject, PointerEvent, KeyboardEvent, useCallback, ChangeEvent } from 'react'

import { StatefulData, IVector2, View, GameMap, getDefaultTile, Tile, areGameMapsEqual, tryPlaceCamera, Camera, areEqualTiles, Vector2, getViewOffset, inDimensionBounds, rgbaToString, RGBA } from "raycaster/interfaces";
import { useHistory, useWindowEvent, useResizeObserver, getCanvasAndContext2D, useCanvasHolderUpdater, withCanvasAndContext } from "raycaster/functions";


import { EditMode, EditorData, MoveEditMode, ZoomEditMode, DrawEditMode, EraseEditMode, LineEditMode, BoxEditMode, EllipseEditMode } from "raycaster/editor"
import { HistoryStack } from "raycaster/structures";

import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaBox } from "react-icons/fa"
import { GiStraightPipe } from "react-icons/gi"
import { BsCircle } from 'react-icons/bs'

import mapEditorStyles from "components/styles/MapEditor.module.css"
import { GameScreen } from './GameScreen';
import { Dimension2D, IDimension2D } from 'interfaces/Dimension';
import { preview } from 'vite';
import { P } from 'vitest/dist/types-bae746aa';
import { Color as ReactColor, ColorResult, SketchPicker, SliderPicker } from 'react-color';
import Texture from 'interfaces/Texture';
import { isImageFile } from 'functions/file';

type EditorEditMode = "MOVE" | "ZOOM" | "DRAW" | "ERASE" | "LINE" | "BOX" | "ELLIPSE"

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
  const [previewCamera, setPreviewCamera] = useState<Camera>(Camera.default().place(previewMap.center.subtract(new Vector2(2, 2) ) ))

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
          { previewingTileCreator ? <GameScreen cameraData={[previewCamera, setPreviewCamera]} mapData={[previewMap, setPreviewMap]} /> : 
          <div className={mapEditorStyles["editing-canvas-holder"]} ref={canvasHolderRef}>
              <canvas style={{cursor: cursor}} className={mapEditorStyles["editing-canvas"]} ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}> Unsupported Web Browser </canvas>
          </div> }
          {/* <GameScreen cameraData={cameraData} mapData={mapData} /> */}
        </div>

      </main>

    </div>

  )
}

function MapEditorSideTool({ title, children = "" }: { title: string, children?: React.ReactNode}) {

  return (
  <div className={mapEditorStyles["side-tool"]}>
    <p className={mapEditorStyles["side-tool-title"]}>{title}</p>
    
    <div className={mapEditorStyles["side-tool-contents"]}>
      { children }
    </div>

  </div>
  )
}

function getSelectedStyle(condition: boolean) {
  return condition ? mapEditorStyles["selected"] : mapEditorStyles["unselected"]
}

function EditorActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={mapEditorStyles["action-button"]} {...props} />
}

function EditModeButton({ children = "", target, current, setter }: { children?: React.ReactNode, target: EditorEditMode, current: EditorEditMode, setter: React.Dispatch<EditorEditMode> } ) {
  return <button className={`${mapEditorStyles["edit-button"]} ${getSelectedStyle(current === target)}`} onClick={() => setter(target)}>{ children }</button>
}

interface EditorToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
}
function EditorToggleButton({selected, ...props}: EditorToggleButtonProps) {
  return <button className={`${mapEditorStyles["toggle-button"]} ${getSelectedStyle(selected)}`} {...props} />
}

interface EditorInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}
function EditorInputField({ label, ...props }: EditorInputFieldProps) {
  return ( <section className={mapEditorStyles["input-field"]}>
    <p className={mapEditorStyles["input-label"]}>{label}</p>
    <input className={mapEditorStyles["input"]} {...props} />
  </section> )
}


function MapGenerator({ onMapGenerate }: { onMapGenerate: (dimension: IDimension2D) => void }) {
  const [newMapDimension, setNewMapDimension] = useState<Dimension2D>(new Dimension2D(10, 10));

  return (
    <MapEditorSideTool title="Map Generator">
      <div className={mapEditorStyles["map-dimensions-input-area"]}>
        <EditorInputField label="Width: " type="number" min={4} onChange={(e) => setNewMapDimension(newMapDimension.withWidth(e.target.valueAsNumber))} value={newMapDimension.width} />
        <EditorInputField label="Height: " type="number" min={4} onChange={(e) => setNewMapDimension(newMapDimension.withHeight(e.target.valueAsNumber))} value={newMapDimension.height} />
      </div>

      <EditorActionButton onClick={() => onMapGenerate(newMapDimension)}> Generate {newMapDimension.width} x {newMapDimension.height} Empty Map </EditorActionButton>
    </MapEditorSideTool>
  )
}



function TileCreator({ onSubmit, onTileChange, previewData }: { onSubmit: (tile: Tile, name: string) => void, onTileChange: (tile: Tile) => void, previewData: StatefulData<boolean> }) {
  const [name, setName] = useState<string>("Unnamed Tile")
  const [tile, setTile] = useState<Tile>(getDefaultTile("Wall Tile"))
  const [previewing, setPreviewing] = previewData

  function submit() {
    onSubmit(tile, name)
  }

  useEffect( () => {
    onTileChange(tile)
  }, [tile])

  function toggleCanCollide() {
    setTile(tile => ({...tile, canCollide: !tile.canCollide}))
  }

  function toggleCanHit() {
    setTile(tile => ({...tile, canHit: !tile.canHit}))
  }

  function onColorChange(res: ColorResult) {
    setTile( tile => ({...tile, color: fromReactColorResult(res) }))
  }

  function toReactColorColor(color: RGBA): ReactColor {
    return {
      r: color.red,
      g: color.green,
      b: color.blue,
      a: color.alpha
    }
  }

  function fromReactColorResult(color: ColorResult): RGBA {
    return {
      red: color.rgb.r,
      green: color.rgb.g,
      blue: color.rgb.b,
      alpha: color.rgb.a !== null && color.rgb.a !== undefined ? Math.trunc(color.rgb.a * 255) : 255
    } 
  }

  function onTileCreatorTextureImport(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files !== null && e.target.files !== undefined) {
      if (e.target.files.length > 0) {
        const file: File = e.target.files[0]
        if (isImageFile(file)) {
          Texture.fromFile(name, file)
          .then(texture => {
            setTile( tile => ({ ...tile, texture: texture })  )
          })
        }
      }
    }
  }


  return (
    <MapEditorSideTool title="Tile Creator">
      <EditorInputField label="Name: " type="text" onChange={(e) => setName(e.target.value)} value={name} />

      <div className={mapEditorStyles["tile-creator-color-picker"]}>
        <SliderPicker
        className='sketch-picker'
        color={toReactColorColor(tile.color)}
        onChange={onColorChange} /> 
      </div>

      <EditorToggleButton selected={tile.canHit} onClick={toggleCanHit}> Can Hit </EditorToggleButton> 
      <EditorToggleButton selected={tile.canCollide} onClick={toggleCanCollide}> Can Collide </EditorToggleButton>
      <input type="file" onChange={onTileCreatorTextureImport} />
      <EditorToggleButton selected={previewing} onClick={() => setPreviewing(!previewing)}> Preview </EditorToggleButton>

      <EditorActionButton onClick={submit}> Create {name} </EditorActionButton>
    </MapEditorSideTool>
  )

}

function TilePicker({ selectedTile, tiles, onTileSelect }: { selectedTile: Tile, tiles: {[key: string]: Tile}, onTileSelect: (tile: Tile) => void } ) {
  return (
    <MapEditorSideTool title="Tile Picker">
      <div className={mapEditorStyles["selected-tiles"]}>
        { Object.entries(tiles).map(([tileName, tile]) => <EditorToggleButton selected={areEqualTiles(selectedTile, tile)} key={`tile: ${tileName}`} onClick={() => onTileSelect(tile)}>{tileName}</EditorToggleButton>)}
      </div>
    </MapEditorSideTool>
  )
}