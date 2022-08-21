import { Children, ReactNode, useState } from "react"

export const MenuSelector = ({ children }: {children: ReactNode } )  => {
	const menus = Children.toArray(children);
	const [currentMenuIndex, setCurrentMenuIndex] = useState<number>(0);
	
	return (
	<div className="GenerationMenu">
		<div className="menu-buttons">
			{	
				Children.map(menus, (child: ReactNode, index: number) => {
					return <button key={`menu-button ${index}`} onClick={() => setCurrentMenuIndex(index)}> <> { () => {
							if (typeof(child) === "object") {
								return (child as any)?.props?.name !== null && (child as any)?.props?.name !== undefined ? (child as any)?.props?.name : index;
							} else if (typeof(child) === "string") {
								return child;
							}
							return index;
						 }
					 } </>  </button>
				})
			}
		</div>

		<div className="menu-selector-content-area" >
			{ menus.at(currentMenuIndex) } 
		</div>
	</div> 
	)	
}

export const MenuSelection = ({ children = "", name }: { children?: ReactNode, name: string }) => {
	return (
		<div className="menu-selection" >
			{ children }
		</div>
	)
} 



