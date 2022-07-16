import React, { useEffect, useRef, useState, KeyboardEvent, MutableRefObject, PointerEvent } from 'react'
import { Vector2 } from '../classes/Data/Vector2';
import { View } from '../classes/Data/View';
import { GameMap } from '../classes/GameMap'
import { EmptyTile } from '../classes/Tiles/EmptyTile';
import { StatefulData } from '../interfaces/StatefulData'
import "./mapeditor.css"

export const MapEditor = ( { mapData }: { mapData: StatefulData<GameMap> }) => {
  const [map, setMap] = mapData;
  const [view, setView] = useState<View>(new View(new Vector2(0, 0), 10));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxCoordinates = (row: number, col: number): [number, number, number, number] => {
    return [ col - view.coordinates.col, row - view.coordinates.row, view.cellSize, view.cellSize ]
  }
  const lastHoveredCell: MutableRefObject<Vector2> = useRef<Vector2>(new Vector2(0, 0));
  const getHoveredCell = (event: PointerEvent<Element>) => { return new Vector2( event.clientY - (view.coordinates.row * view.cellSize) / view.cellSize, event.clientX - (view.coordinates.col * view.cellSize) / view.cellSize);  }

  function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {

    for (let y = view.coordinates.row % view.cellSize; y <= canvas.height; y += view.cellSize) {
      for (let x = view.coordinates.col % view.cellSize; x <= canvas.width; x += view.cellSize) {
          const row = Math.floor(view.coordinates.row + (y / view.cellSize));
          const col = Math.floor(view.coordinates.col + (x / view.cellSize));
          if (map.inBounds(row, col)) {
            if (map.at(row, col) instanceof EmptyTile) continue;
            context.fillStyle = map.at(row, col).color().toRGBAString();
            context.fillRect(x, y, view.cellSize, view.cellSize)
          }
      }
    }
  }

  function renderGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.strokeStyle = 'black';
    context.beginPath()
    for (let y = view.coordinates.row % view.cellSize; y <= canvas.height; y += view.cellSize) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }

    for (let x = view.coordinates.col % view.cellSize; x <= canvas.width; x += view.cellSize) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }

    context.stroke();
  }

  function drawCell(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, row: number, col: number) {
    context.fillRect( (row - view.coordinates.row) * view.cellSize, (col - view.coordinates.col) * view.cellSize, view.cellSize, view.cellSize  );
  }

  function render() {

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context !== null && context !== undefined) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'gray';
        context.fillRect(0, 0, canvas.width, canvas.height);
        renderGrid(canvas, context);
        renderWalls(canvas, context);

        context.globalAlpha = 0.5;
        drawCell(canvas, context, lastHoveredCell.current.row, lastHoveredCell.current.col);
        context.globalAlpha = 1;
      }
    }
  }

  function pointerMove(event: PointerEvent<Element>) {
    console.log(view);
    lastHoveredCell.current = getHoveredCell(event);
    setView(new View(view.coordinates.add(new Vector2(event.movementY, event.movementX)), view.cellSize))
  }



  useEffect(render)
  

    
  return (
    <div className='container' onPointerMove={pointerMove} tabIndex={0}>
      <canvas ref={canvasRef} className="editing canvas" width={800} height={800}> Unsupported Web Browser </canvas>
    </div>
  )
}
