import React, { useEffect, useRef, useState, KeyboardEvent, MutableRefObject, PointerEvent } from 'react'
import { Vector2 } from '../classes/Data/Vector2';
import { View } from '../classes/Data/View';
import { EditMode } from '../classes/Editor/EditMode';
import { MoveEditMode } from '../classes/Editor/MoveEditMode';
import { ZoomEditMode } from '../classes/Editor/ZoomEditMode';
import { GameMap } from '../classes/GameMap'
import { EmptyTile } from '../classes/Tiles/EmptyTile';
import { WallTile } from '../classes/Tiles/WallTile';
import { StatefulData } from '../interfaces/StatefulData'
import "./mapeditor.css"
import { FaBrush, FaArrowsAlt, FaSearch, FaEraser, FaLine, FaBox } from "react-icons/fa"
import { hover } from '@testing-library/user-event/dist/hover';
import { LineSegment } from '../classes/Data/LineSegment';
import { useResizeObserver } from '../functions/useResizeObserver';
import { EditorData } from '../classes/Editor/EditorData';
import { EraseEditMode } from '../classes/Editor/EraseEditMode';
import { DrawEditMode } from '../classes/Editor/DrawEditMode';
import { LineEditMode } from '../classes/Editor/LineEditMode';
import { BoxEditMode } from '../classes/Editor/BoxEditMode';


export const MapEditor = ( { mapData }: { mapData: StatefulData<GameMap> }) => {
  enum EditorEditMode { MOVE, ZOOM, DRAW, ERASE, LINE, BOX }
  const [map, setMap] = mapData;
  const [cursor, setCursor] = useState<string>('crosshair');
  const [view, setView] = useState<View>(new View(new Vector2(0.5, 0.5), 10));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHoveredCell: MutableRefObject<Vector2> = useRef<Vector2>(new Vector2(0, 0));
  const isPointerDown: MutableRefObject<boolean> = useRef<boolean>(false);

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
      getHoveredCell: getHoveredCell
    }
  }
  
  const editorModes: {[key in EditorEditMode]: EditMode} = { 
    [EditorEditMode.DRAW]: new DrawEditMode(getEditorData()),
    [EditorEditMode.ZOOM]: new ZoomEditMode(getEditorData()),
    [EditorEditMode.MOVE]: new MoveEditMode(getEditorData()),
    [EditorEditMode.ERASE]: new EraseEditMode(getEditorData()),
    [EditorEditMode.LINE]: new LineEditMode(getEditorData()),
    [EditorEditMode.BOX]: new BoxEditMode(getEditorData())
  }
  const [editMode, setEditMode] = useState<EditorEditMode>(EditorEditMode.DRAW);

  // const center: (position: Vector2) => void = (position: Vector2) => {
  //   const canvas: HTMLCanvasElement | null = canvasRef.current;
  //   if (canvas !== null && canvas !== undefined) {
  //     setView( view.withCoordinates( new Vector2(position.row - (canvas.width / view.cellSize), position.col - (canvas.height / view.cellSize)) )  )
  //   }
  // }

  function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    console.log('offset: ', view.offset());
    // for (let y = -view.offset().row; y <= canvas.height; y += view.cellSize) {
    //   for (let x = -view.offset().col; x <= canvas.width; x += view.cellSize) {
    //       const row = Math.floor(view.coordinates.row + (y / view.cellSize));
    //       const col = Math.floor(view.coordinates.col + (x / view.cellSize));
    //       if (map.inBounds(row, col)) {
    //         context.fillStyle = map.at(row, col).color().toRGBAString();
    //         context.fillRect(x, y, view.cellSize, view.cellSize)
    //       }
    //   }
    // }

    for (let row = 0; row < canvas.height / view.cellSize; row++) {
      for (let col = 0; col < canvas.width / view.cellSize; col++) {
        if (map.inBounds(Math.floor(view.coordinates.row + row), Math.floor(view.coordinates.col + col) )) {
          context.fillStyle = map.at(Math.floor(view.coordinates.row + row), Math.floor(view.coordinates.col + col)).color().toRGBString();
          context.fillRect(-view.offset().col + col * view.cellSize, -view.offset().row + row * view.cellSize, view.cellSize, view.cellSize);
        }
      }
    }


  }

  class Innerclass {
    name: string
    constructor(name: string) {
      this.name = name;
    }
  }

  console.log(new Innerclass('jacoby').name);

  function renderGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.strokeStyle = 'black';
    context.beginPath()
    for (let y = -view.offset().row; y <= canvas.height; y += view.cellSize) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    
    for (let x = -view.offset().col; x <= canvas.width; x += view.cellSize) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }

    context.stroke();
  }

  function drawCell(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, row: number, col: number) {
    console.log(view);
    context.fillRect((col - view.coordinates.col) * view.cellSize, (row - view.coordinates.row) * view.cellSize, view.cellSize, view.cellSize  );
  }

  function render() {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context !== null && context !== undefined) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        renderWalls(canvas, context);
        renderGrid(canvas, context);

        context.globalAlpha = 0.5;
        context.fillStyle = 'blue';
        drawCell(canvas, context, lastHoveredCell.current.row, lastHoveredCell.current.col);
        context.globalAlpha = 1;
      }
    }
  }

  function drawMouseShadow(event: PointerEvent<Element>) {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context !== null && context !== undefined) {
        context.globalAlpha = 0.5;
        context.fillStyle = 'blue';
        const hoveredCell = getHoveredCell(event);
        drawCell(canvas, context, hoveredCell.row, hoveredCell.col);
        context.globalAlpha = 1;
      }
    }
  }


  // function move(event: PointerEvent<Element>) {
  //   if (isPointerDown.current === true) {
  //     const movementDirection: Vector2 = new Vector2(event.movementY, event.movementX);
  //     if (movementDirection.length !== 0) {
  //       setView(view.withCoordinates( view.coordinates.add(movementDirection.toLength(20 / view.cellSize)) ));
  //     }
  //   }
  // }
  
  // function draw(event: PointerEvent<Element>) {
  //   const hoveredCell = getHoveredCell(event);
  //   if (isPointerDown.current) {
  //     console.log(new LineSegment(lastHoveredCell.current, hoveredCell).toCells());
  //     new LineSegment(lastHoveredCell.current, hoveredCell).toCells().forEach(cell => {
  //     if (map.inBounds(cell.row, cell.col)) {
  //         setMap((map) => map.placeTile(new WallTile(), cell.row, cell.col))
  //     }});
  //   }
  // }

  // function erase(event: PointerEvent<Element>) {
  //   const hoveredCell = getHoveredCell(event);
  //   if (isPointerDown.current) {
  //     new LineSegment(lastHoveredCell.current, hoveredCell).toCells().forEach(cell => {
  //     if (map.inBounds(cell.row, cell.col)) {
  //         setMap((map) => map.placeTile(new EmptyTile(), cell.row, cell.col))
  //     }});
  //   }
  // }


  
  // const zoomDirection = new Vector2(-1, -1);
  // function zoom(event: PointerEvent<Element>) {
  //   if (isPointerDown.current === true) {
  //     const movementVector: Vector2 = new Vector2(event.movementY, event.movementX);
  //     if (movementVector.length > 0) {
  //       setView(view.withCellSize( Math.max(2, view.cellSize + Math.trunc(Vector2.dotProduct(zoomDirection, movementVector.normalized()  )) )  ));
  //       }
  //   }
  // }

  function onPointerMove(event: PointerEvent<Element>) {
    editorModes[editMode].setEditorData(getEditorData())
    editorModes[editMode].onPointerMove?.(event);
  //   switch (editMode) {
  //     case EditorEditMode.MOVE: move(event); break;
  //     case EditorEditMode.ZOOM: zoom(event); break;
  //     case EditorEditMode.DRAW: draw(event); break;
  //     case EditorEditMode.ERASE: erase(event); break;
  //   }
      lastHoveredCell.current = getHoveredCell(event);
      render();
  }
  
  function onPointerDown(event: PointerEvent<Element>) {
    isPointerDown.current = true;
    editorModes[editMode].setEditorData(getEditorData())
    editorModes[editMode].onPointerDown?.(event);
    lastHoveredCell.current = getHoveredCell(event);
    // switch (editMode) {
    //   case EditorEditMode.DRAW: draw(event); break;
    //   case EditorEditMode.ERASE: erase(event); break;
    // }
  }

  function onPointerUp(event: PointerEvent<Element>) {
    editorModes[editMode].setEditorData(getEditorData())
    editorModes[editMode].onPointerUp?.(event);
    isPointerDown.current = false;
  }

  function onPointerLeave(event: PointerEvent<Element>) {
    editorModes[editMode].setEditorData(getEditorData())
    editorModes[editMode].onPointerLeave?.(event);
    isPointerDown.current = false;
  }

  useEffect(render)

  useEffect(() => {
    // setCursor(editorModes[editMode].cursor())
    setCursor('default');
  }, [editMode])

  function updateCanvasSize() {
    if (canvasRef.current !== null && canvasRef.current !== undefined) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      const rect: DOMRect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  useEffect(() => {
    if (canvasRef.current !== null && canvasRef.current !== undefined) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      updateCanvasSize();
      setView(view => view.withCellSize( Math.trunc( Math.min( canvas.height / map.Dimensions.rows, canvas.width / map.Dimensions.cols  ) ) ))
      setView(view => view.withCoordinates( new Vector2(map.center.row - (canvas.height / view.cellSize / 2), map.center.col - (canvas.width / view.cellSize / 2)).int() ));
    }
  }, [])

  // useResizeObserver(updateCanvasSize)
    
  return (
    <div className='editor-container'>
      <div className="editing-buttons"> 
        <button className={`edit-button ${ editMode === EditorEditMode.DRAW ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.DRAW)}> <FaBrush /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.MOVE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.MOVE)}> <FaArrowsAlt /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.ZOOM ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.ZOOM)}> <FaSearch /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.ERASE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.ERASE)}> <FaEraser /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.LINE ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.LINE)}> <FaLine /> </button>
        <button className={`edit-button ${ editMode === EditorEditMode.BOX ? 'selected' : '' }`} onClick={() => setEditMode(EditorEditMode.BOX)}> <FaBox /> </button>
      </div>

      <canvas style={{cursor: cursor}} className="editing-canvas" ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave}> Unsupported Web Browser </canvas>
    </div>
  )
}