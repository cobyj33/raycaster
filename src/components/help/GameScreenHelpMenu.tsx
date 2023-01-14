import React from 'react'
import helpMenuStyles from "components/styles/HelpMenu.module.css"
import GSHWstyles from "components/styles/GameScreenHelpMenu.module.css"

type Action = () => void
export const GameScreenHelpMenu = () => {
  return <div className={helpMenuStyles["window"]}>
    <h1 className={helpMenuStyles["title"]}> Help: Game Screen </h1>
    <h3 className={helpMenuStyles["menu-description"]}> The main screen of JRaycaster </h3>

    
  </div>
}

export default GameScreenHelpMenu