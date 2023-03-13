import mapEditorStyles from "components/styles/MapEditor.module.css"
import MapEditorSideTool from "components/editor/common/MapEditorSideTool"
import { areEqualTiles, Tile } from "libray/Tile"
import EditorToggleButton from "../common/EditorToggleButton"


export function TilePicker({ selectedTile, tiles, onTileSelect }: { selectedTile: Tile, tiles: {[key: string]: Tile}, onTileSelect: (tile: Tile) => void } ) {
    return (
      <MapEditorSideTool title="Tile Picker">
        <div className={mapEditorStyles["selected-tiles"]}>
          { Object.entries(tiles).map(([tileName, tile]) => <EditorToggleButton selected={areEqualTiles(selectedTile, tile)} key={`tile: ${tileName}`} onClick={() => onTileSelect(tile)}>{tileName}</EditorToggleButton>)}
        </div>
      </MapEditorSideTool>
    )
}

export default TilePicker