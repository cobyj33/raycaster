import mapEditorStyles from "components/styles/MapEditor.module.css"

export function getEditorSelectedStyle(condition: boolean) {
    return condition ? mapEditorStyles["selected"] : mapEditorStyles["unselected"]
}