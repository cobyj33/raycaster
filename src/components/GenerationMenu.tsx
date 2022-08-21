import { useState, useRef, PointerEvent, KeyboardEvent } from "react"
import { GenerationAlgorithm } from "../classes/Generation/GenerationAlgorithm"
import { BoardDrawing } from "./BoardDrawing"
import { GameMap } from "../classes/GameMap"
import { Dimension } from '../classes/Data/Dimension';
import {View} from "../classes/Data/View";
import { Vector2 } from "../classes/Data/Vector2"


export const GenerationMenu = ( { algo }: { algo: GenerationAlgorithm } ) => {
	const [map, setMap] = useState<GameMap>(GameMap.filledEdges(new Dimension(50, 50)));
    const [view, setView] = useState<View>(new View(new Vector2(0, 0), 10))

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
