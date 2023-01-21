
import mapEditorStyles from "components/styles/MapEditor.module.css"


export function MapEditorSideTool({ title, children = "" }: { title: string, children?: React.ReactNode}) {
    return (
        <div className={mapEditorStyles["side-tool"]}>
        <p className={mapEditorStyles["side-tool-title"]}>{title}</p>

        <div className={mapEditorStyles["side-tool-contents"]}>
            { children }
        </div>

        </div>
    )
}

export default MapEditorSideTool