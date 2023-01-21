import mapEditorStyles from "components/styles/MapEditor.module.css"


export function EditorActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button className={mapEditorStyles["action-button"]} {...props} />
}

export default EditorActionButton