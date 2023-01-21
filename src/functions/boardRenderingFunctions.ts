import { getViewOffset, View } from "interfaces/View";
import { GameMap } from "interfaces/GameMap";
import { inDimensionBounds } from "interfaces/Ray";
import { Tile } from "interfaces/Tile";
import { IVector2 } from "interfaces/Vector2";
import { RGBA, rgbaToString } from "interfaces/Color";

export function renderWalls(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View, map: GameMap): void {
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

 export function renderGhostTiles(context: CanvasRenderingContext2D, view: View, ghostTilePositions: IVector2[], selectedTile: Tile) {
    if (ghostTilePositions.length === 0) return;
     context.save();
    context.globalAlpha = 0.5;
    context.fillStyle = rgbaToString(selectedTile.color);
    ghostTilePositions.forEach(pos => drawCell(context, view, pos.row, pos.col))
     context.restore();
  }

 export function renderGrid(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View) {
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

 export function drawCell(context: CanvasRenderingContext2D, view: View, row: number, col: number) {
    context.fillRect((col - view.col) * view.cellSize, (row - view.row) * view.cellSize, view.cellSize, view.cellSize  );
  }
