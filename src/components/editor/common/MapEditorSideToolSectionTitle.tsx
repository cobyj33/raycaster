import mapEditorStyles from "components/styles/MapEditor.module.css"

export function MapEditorSideToolSectionTitle({ children }: { children: string }) {
    return <p className={mapEditorStyles["side-tool-section-title"]}>{children}</p>
}

export default MapEditorSideToolSectionTitle
