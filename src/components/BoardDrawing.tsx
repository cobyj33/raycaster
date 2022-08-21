import { RefObject, useEffect, useRef } from 'react'
import { Vector2 } from '../classes/Data/Vector2';
import { View } from '../classes/Data/View'
import { renderWalls, renderGrid, renderGhostTiles, drawCell } from '../functions/boardRenderingFunctions';
import { useCanvasUpdater } from '../functions/hooks';
import { GameMap } from "../classes/GameMap"
import { StatefulData } from "../interfaces/StatefulData"
// import "./styles/boarddrawing.scss"

export const BoardDrawing = ({ mapData, view, className }: { mapData: StatefulData<GameMap>, view: View, className?: string }) => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [map, setMap] = mapData;
  function render() {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d', { alpha: false });
      if (context !== null && context !== undefined) {
        context.fillStyle = 'rgb(60, 60, 60)'
        context.fillRect(0, 0, canvas.width, canvas.height);
	renderWalls(canvas, context, view, map);
	renderGrid(canvas, context, view);
      }
    }
  }

  useEffect(render);
  useCanvasUpdater(canvasRef);
  
  return <canvas className={className ?? "board-drawing"} ref={canvasRef}></canvas>
}
