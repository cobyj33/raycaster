import React from "react"
import { getDefaultTile, Tile } from "interfaces/Tile"
import { RGBA } from "interfaces/Color"
import { Color as ReactColorColor, ColorResult, SketchPicker, SliderPicker } from 'react-color';
import Texture from "interfaces/Texture";
import mapEditorStyles from "components/styles/MapEditor.module.css"
import MapEditorSideTool from "../common/MapEditorSideTool";
import EditorInputField from "../common/EditorInputField";
import MapEditorSideToolSectionTitle from "../common/MapEditorSideToolSectionTitle";
import EditorToggleButton from "../common/EditorToggleButton";
import TextureUpload from "../common/TextureUpload";
import EditorActionButton from "../common/EditorActionButton";
import { StatefulData } from "interfaces/util";


interface TileCreatorState {
    name: string,
    tile: Tile
}

const INITIAL_TILE_CREATOR_STATE = {
    name: "Unnamed Tile",
    tile: getDefaultTile("Wall Tile")
}

export function TileCreator({ onSubmit, onTileChange, previewData }: { onSubmit: (tile: Tile, name: string) => void, onTileChange: (tile: Tile) => void, previewData: StatefulData<boolean> }) {
    const [name, setName] = React.useState<string>("Unnamed Tile")
    const [tile, setTile] = React.useState<Tile>(getDefaultTile("Wall Tile"))
    const [previewing, setPreviewing] = previewData
  
    function submit() {
      onSubmit(tile, name)
    }
  
    React.useEffect( () => {
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
  
    function toReactColorColor(color: RGBA): ReactColorColor {
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
  
    function onTextureUpload(texture: Texture) {
      setTile(tile => ({...tile, texture: texture }))
    }
  
    return (
      <MapEditorSideTool title="Tile Creator">
          <div className={mapEditorStyles["tile-creator-container"]}>
  
              <EditorInputField label="Name: " type="text" onChange={(e) => setName(e.target.value)} value={name} />
  
              <MapEditorSideToolSectionTitle>Color</MapEditorSideToolSectionTitle>
  
              <div className={mapEditorStyles["tile-creator-color-picker"]}>
                  <SliderPicker
                  className='sketch-picker'
                  color={toReactColorColor(tile.color)}
                  onChange={onColorChange} /> 
              </div>
  
  
              <MapEditorSideToolSectionTitle>Interaction</MapEditorSideToolSectionTitle>
  
              <div className={mapEditorStyles["tile-creator-row"]}>
                  <div className={mapEditorStyles["tile-creator-toggle-buttons"]}>
                      <EditorToggleButton selected={tile.canCollide} onClick={toggleCanCollide}> Can Collide </EditorToggleButton>
                      <EditorToggleButton selected={tile.canHit} onClick={toggleCanHit}> Can Hit </EditorToggleButton> 
                  </div>
  
                  <TextureUpload onTextureUpload={onTextureUpload} />
              </div>
  
  
  
              <EditorToggleButton selected={previewing} onClick={() => setPreviewing(!previewing)}> Preview </EditorToggleButton>
  
              <EditorActionButton onClick={submit}> Create {name} </EditorActionButton>
  
          </div>
      </MapEditorSideTool>
    )
  
  }

  export default TileCreator