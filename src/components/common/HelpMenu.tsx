import React from "react"
import helpMenuStyles from "components/styles/HelpMenu.module.css"

interface HelpMenuProps {
    title: string,
    description: string,
    children: React.ReactNode
}

export function HelpMenu({ title, description, children }: HelpMenuProps) {
    return ( 
    <div className={helpMenuStyles["window"]}>
        <h1 className={helpMenuStyles["title"]}> { title } </h1>
        <h3 className={helpMenuStyles["menu-description"]}> { description } </h3>

        <main className={helpMenuStyles["content"]}>
            { children }
        </main>
  </div>
  )

}

export default HelpMenu