import { useState } from 'react'
import { Color } from '../classes/Data/Color';
import { StatefulData } from '../interfaces/StatefulData'
import { Tile } from '../interfaces/Tile'
import { SketchPicker } from "react-color"
import { CustomTile } from '../classes/Tiles/CustomTile';

export const TileCreator = ({ tileData, className }: { tileData: StatefulData<Tile[]>, className: string }) => {
    const [savedTiles, setSavedTiles] = tileData;
    const [name, setName] = useState<string>("");
    const [color, setColor] = useState<Color>(new Color(0, 0, 0, 0));
    const [canHit, setCanHit] = useState<boolean>(true);
    const [canCollide, setCanCollide] = useState<boolean>(true);

    function saveTile() {
        if (!savedTiles.some(tile => tile.name === name)) {
            setSavedTiles(tiles => tiles.concat(new CustomTile(name, new Color(color.red, color.green, color.blue, Math.trunc(color.alpha * 255)), canHit, canCollide)));
        }
    }

  return (
    <div className={className}>
        <input className='tile-creator-name-input' onChange={e => setName(e.target.value)  } value={name} />
        <SketchPicker className='sketch-picker' color={{ r: color.red, g: color.green, b: color.blue, a: color.alpha}} onChange={pickedColor => setColor(new Color(pickedColor.rgb.r, pickedColor.rgb.g, pickedColor.rgb.b, pickedColor.rgb.a ?? 255)) }/> 
        <button className='tile-creator-button tile-creator-canHit-button' onClick={() => setCanHit(!canHit)}> canHit: <b> {canHit.toString()} </b> </button>
        <button className='tile-creator-button tile-creator-canCollide-button' onClick={() => setCanCollide(!canCollide)}> canCollide: <b> {canCollide.toString()} </b> </button>
        <button className='tile-creator-button tile-creator-save-button' onClick={saveTile}> Save Tile </button>
    </div>
  )
}
