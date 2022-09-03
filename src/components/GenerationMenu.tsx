// import { useState } from "react"
import { GenerationAlgorithm } from "../classes/Generation/GenerationAlgorithm"
// import { BoardDrawing } from "./BoardDrawing"
// import { View, GameMap, getEmptyMap, getFilledMapEdges } from "raycaster/interfaces";


export const GenerationMenu = ( { algo }: { algo: GenerationAlgorithm } ) => {
	// const [map, setMap] = useState<GameMap>(getFilledMapEdges( getEmptyMap({ row: 50, col: 50 })   ) );
    // const [view, setView] = useState<View>({
        // row: 0,
        // col: 0,
        // cellSize: 5
    // });

	return (
	<div className="GenerationMenu">
		<div className="algo-top-bar">
			
		</div>

		<div className="algo-preview-area"> 
		
			<div className="algo-preview-controls">

			</div>
        
        { algo.name }
        {/* <BoardDrawing view={view} mapData={[map, setMap]}  className="algo-preview-canvas"/> */} 
		</div>

		<div className="algo-information">

		</div>
	</div> 
	)	
} 
