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
            setSavedTiles(tiles => tiles.concat(new CustomTile(name, color, canHit, canCollide)));
        }
    }

  return (
    <div className={className}>
        <input onChange={e => setName(e.target.value)  } value={name} />
        <SketchPicker color={{ r: color.red, g: color.green, b: color.blue, a: color.alpha}} onChange={pickedColor => setColor(new Color(pickedColor.rgb.r, pickedColor.rgb.g, pickedColor.rgb.b, pickedColor.rgb.a ?? 255)) }/> 
        <button onClick={() => setCanHit(!canHit)}> canHit: {canHit.toString()} </button>
        <button onClick={() => setCanCollide(!canCollide)}> canCollide: {canCollide.toString()} </button>
        <button onClick={saveTile}> Save Tile </button>
    </div>
  )
}
