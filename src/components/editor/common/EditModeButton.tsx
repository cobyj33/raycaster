import mapEditorStyles from "components/styles/MapEditor.module.css"
import { EditorEditMode } from "components/screens/MapEditor"
import { getEditorSelectedStyle } from "./style"

export function EditModeButton({ children = "", target, current, setter }: { children?: React.ReactNode, target: EditorEditMode, current: EditorEditMode, setter: React.Dispatch<EditorEditMode> } ) {
    return <button className={`${mapEditorStyles["edit-button"]} ${getEditorSelectedStyle(current === target)}`} onClick={() => setter(target)}>{ children }</button>
}

export default EditModeButton