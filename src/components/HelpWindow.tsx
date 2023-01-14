import React from 'react'
import helpWindowStyles from "components/styles/HelpWindow.module.css"

import { FaWindowClose } from "react-icons/fa"

type Action = () => void
export const HelpWindow = ({ children, title = "", onClose = null }: { children: React.ReactNode, title?: string, onClose?: Action | null }) => {
    function close() {
        if (onClose !== null && onClose !== undefined) {
            onClose()
        }
    }

  return (
    <div className={helpWindowStyles["help-window"]}>
        <div className={helpWindowStyles["top-bar"]}>
            <h3 className={helpWindowStyles["title"]}> {title} </h3>

            <button className={helpWindowStyles["close-button"]} onClick={close}>
                <FaWindowClose />
            </button>
        </div>

        <div className={helpWindowStyles["content-area"]}>
            { children }
        </div>
    </div>
  )
}

export default HelpWindow