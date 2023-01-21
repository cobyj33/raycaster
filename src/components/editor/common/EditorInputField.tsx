import mapEditorStyles from "components/styles/MapEditor.module.css"


interface EditorInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export function EditorInputField({ label, ...props }: EditorInputFieldProps) {
    return (
        <section className={mapEditorStyles["input-field"]}>
            <p className={mapEditorStyles["input-label"]}>{label}</p>
            <input className={mapEditorStyles["input"]} {...props} />
        </section>
    )
}

export default EditorInputField