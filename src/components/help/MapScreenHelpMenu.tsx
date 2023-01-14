import React from 'react'
import helpMenuStyles from "components/styles/HelpMenu.module.css"
import MSHMstyles from "components/styles/MapScreenHelpMenu.module.css"

type Action = () => void
export const MapScreenHelpMenu = () => {
  return <div className={helpMenuStyles["window"]}>
    <h1 className={helpMenuStyles["title"]}> Help: Map Screen </h1>
    <h3 className={helpMenuStyles["menu-description"]}> Behind the Scenes </h3>
    
  </div>
}

export default MapScreenHelpMenu