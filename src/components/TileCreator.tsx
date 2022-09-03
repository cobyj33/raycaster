import { useState } from 'react'
import { Tile, getFillerTile, StatefulData  } from "raycaster/interfaces" 
import { SketchPicker } from "react-color"

export const TileCreator = ({ tileData, className }: { tileData: StatefulData<{ [key: string]: Tile }>, className: string }) => {
    const [, setSavedTiles] = tileData;
    const [name, setName] = useState<string>("");
    const [tile, setTile] = useState<Tile>(getFillerTile());
    function saveTile() {
        setSavedTiles( savedTiles => ({...savedTiles,
            name: {...tile,
                color: {
                    ...tile.color
                } 
            }
        }) );
    }

  return (
    <div className={className}>
        <input className='tile-creator-name-input' onChange={e => setName(e.target.value) } value={name} />
      <SketchPicker
      className='sketch-picker'
      color={{ r: tile.color.red, g: tile.color.green, b: tile.color.blue, a: tile.color.alpha}}
      onChange={pickedColor => setTile( tile => (
          {...tile,
            color: {
                    red: pickedColor.rgb.r,
                    green: pickedColor.rgb.g,
                    blue: pickedColor.rgb.b,
                    alpha: pickedColor.rgb.a !== null && pickedColor.rgb.a !== undefined ? Math.trunc(pickedColor.rgb.a * 255) : 255
                } 
            })
      )} /> 

        <button className='tile-creator-button tile-creator-canHit-button' onClick={() => setTile( (tile: Tile) => ({ ...tile, canHit: !tile.canHit })  )  }> canHit: <b> {tile.canHit.toString()} </b> </button>
        <button className='tile-creator-button tile-creator-canCollide-button' onClick={() => setTile( (tile: Tile) => ({ ...tile, canCollide: !tile.canCollide })  )  }> canCollide: <b> {tile.canCollide.toString()} </b> </button>
        <button className='tile-creator-button tile-creator-save-button' onClick={saveTile}> Save Tile </button>
    </div>
  )
}
