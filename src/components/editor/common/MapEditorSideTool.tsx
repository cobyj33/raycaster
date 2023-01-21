import React from "react"
import mapEditorStyles from "components/styles/MapEditor.module.css"
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa"


export function MapEditorSideTool({ title, children = "" }: { title: string, children?: React.ReactNode}) {
    const [opened, setOpened] = React.useState<boolean>(false)

    return (
        <div className={mapEditorStyles["side-tool"]}>
        <button className={mapEditorStyles["side-tool-title"]} onClick={() => setOpened(!opened)}>{title} { opened ? <FaArrowAltCircleUp /> : <FaArrowAltCircleDown /> }</button>

        <div className={mapEditorStyles["side-tool-contents"]}>
            { opened ? children : "" }
        </div>

        </div>
    )
}

export default MapEditorSideTool