import React from 'react'
import MEHMstyles from "components/styles/MapEditorHelpMenu.module.css"
import HelpMenu from 'components/common/HelpMenu'

type Action = () => void
export const MapEditorHelpMenu = () => {
    return (
    <HelpMenu title="Help: Map Editor" description='Welcome to the Playground'>
    
    </HelpMenu>
    ) 
}

export default MapEditorHelpMenu