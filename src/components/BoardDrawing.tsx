import { RefObject, useEffect, useRef } from 'react'
import { View, GameMap, StatefulData } from "raycaster/interfaces" 
import { renderWalls, renderGrid, useCanvas2DUpdater } from 'raycaster/functions';

export const BoardDrawing = ({ mapData, view, className }: { mapData: StatefulData<GameMap>, view: View, className?: string }) => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
    const [map,] = mapData;
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
  useCanvas2DUpdater(canvasRef);
  
  return <canvas className={className ?? "board-drawing"} ref={canvasRef}></canvas>
}
