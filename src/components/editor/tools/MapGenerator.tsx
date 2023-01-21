import React from "react"
import mapEditorStyles from "components/styles/MapEditor.module.css"
import { Dimension2D, IDimension2D } from "interfaces/Dimension";
import EditorActionButton from "../common/EditorActionButton";
import EditorInputField from "../common/EditorInputField";
import MapEditorSideTool from "../common/MapEditorSideTool";



export function MapGenerator({ onMapGenerate }: { onMapGenerate: (dimension: IDimension2D) => void }) {
    const [newMapDimension, setNewMapDimension] = React.useState<Dimension2D>(new Dimension2D(10, 10));

    return (
        <MapEditorSideTool title="Map Generator">
        <div className={mapEditorStyles["map-dimensions-input-area"]}>
            <EditorInputField label="Width: " type="number" min={4} onChange={(e) => setNewMapDimension(newMapDimension.withWidth(e.target.valueAsNumber))} value={newMapDimension.width} />
            <EditorInputField label="Height: " type="number" min={4} onChange={(e) => setNewMapDimension(newMapDimension.withHeight(e.target.valueAsNumber))} value={newMapDimension.height} />
        </div>

        <EditorActionButton onClick={() => onMapGenerate(newMapDimension)}> Generate {newMapDimension.width} x {newMapDimension.height} Empty Map </EditorActionButton>
        </MapEditorSideTool>
    )
}

export default MapGenerator