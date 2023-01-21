import React from "react"
import mapEditorStyles from "components/styles/MapEditor.module.css"
import { getEditorSelectedStyle } from "./style"


interface EditorToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected: boolean
}

export function EditorToggleButton({selected, ...props}: EditorToggleButtonProps) {
    return <button className={`${mapEditorStyles["toggle-button"]} ${getEditorSelectedStyle(selected)}`} {...props} />
}
  
export default EditorToggleButton