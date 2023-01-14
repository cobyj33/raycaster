import React from 'react'
import helpMenuStyles from "components/styles/HelpMenu.module.css"
import MEHMstyles from "components/styles/MapEditorHelpMenu.module.css"

type Action = () => void
export const MapEditorHelpMenu = () => {
  return <div className={helpMenuStyles["window"]}> 
    <h1 className={helpMenuStyles["title"]}> Help: Map Editor </h1>

    <h3 className={helpMenuStyles["menu-description"]}> Welcome to the Playground </h3>
    
  </div>
}

export default MapEditorHelpMenu