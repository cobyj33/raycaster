import { View } from "../classes/Data/View"
import { GameMap } from "../classes/GameMap"
import { Vector2 } from "../classes/Data/Vector2"
import { Tile } from "../interfaces/Tile"


export function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View, map: GameMap) {
    context.save();
    for (let row = 0; row < canvas.height / view.cellSize; row++) {
      for (let col = 0; col < canvas.width / view.cellSize; col++) {
        const targetPosition: Vector2 = new Vector2(Math.floor(view.coordinates.row + row), Math.floor(view.coordinates.col + col));
        if (map.inBounds( targetPosition.row, targetPosition.col )) {
          context.fillStyle = map.at(targetPosition.row, targetPosition.col).color().toRGBAString();
          context.globalAlpha = map.at(targetPosition.row, targetPosition.col).color().alpha / 255;
          context.fillRect(-view.offset().col + col * view.cellSize, -view.offset().row + row * view.cellSize, view.cellSize, view.cellSize);
        }
      }
    }
    context.restore();
  }

 export function renderGhostTiles(context: CanvasRenderingContext2D, view: View, ghostTilePositions: Vector2[], selectedTile: Tile) {
    if (ghostTilePositions.length === 0) return;
    const oldData = { globalAlpha: context.globalAlpha, fillStyle: context.fillStyle }
    context.globalAlpha = 0.5;
    context.fillStyle = selectedTile.color().toRGBString();
    ghostTilePositions.forEach(pos => drawCell(context, view, pos.row, pos.col))
    context.globalAlpha = oldData.globalAlpha;
    context.fillStyle = oldData.fillStyle;
  }

 export function renderGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View) {
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

 export function drawCell(context: CanvasRenderingContext2D, view: View, row: number, col: number) {
    context.fillRect((col - view.coordinates.col) * view.cellSize, (row - view.coordinates.row) * view.cellSize, view.cellSize, view.cellSize  );
  }
