import React from "react"
import mapEditorStyles from "components/styles/MapEditor.module.css"
import { useCanvasHolderUpdater } from "jsutil/react"
import { isImageFile } from "jsutil/browser"
import { withCanvasAndContextSaved } from "jsutil/react"
import Texture from "interfaces/Texture"


export function TextureUpload({ onTextureUpload, textureName = "" }: { onTextureUpload: (texture: Texture) => void, textureName?: string }) {
    const [texture, setTexture] = React.useState<Texture | null>(null)

    function getUploadedTextureName(file: File) {
        if (textureName.length > 0) {
            return textureName
        }
        return file.name
    }

    React.useEffect(render, [texture])

    function onTileCreatorTextureImport(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files !== null && e.target.files !== undefined) {
            if (e.target.files.length > 0) {
            const file: File = e.target.files[0]
            if (isImageFile(file)) {
                Texture.fromFile(getUploadedTextureName(file), file)
                .then(texture => {
                    setTexture(texture)
                    onTextureUpload(texture)
                })
            }
            }
        }
    }

    
    const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null)
    const canvasHolderRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null)
    function render() {
        if (texture !== null && texture !== undefined) {
            withCanvasAndContextSaved(canvasRef, (canvas, context) => {
                const tempCanvas = document.createElement("canvas")
                tempCanvas.width = texture.width;
                tempCanvas.height = texture.height;
                const tempContext = tempCanvas.getContext("2d")
                if (tempContext !== null && tempContext !== undefined) {
                    texture.draw(tempContext, 0, 0)
                    context.scale(1, -1)
                    context.translate(0, -canvas.height)
                    context.scale(canvas.width / texture.width, canvas.height / texture.height)
                    context.drawImage(tempCanvas, 0, 0)
                }
            })
        }
    }

    useCanvasHolderUpdater(canvasRef, canvasHolderRef, render)
    

    return (
        <div className={mapEditorStyles["texture-upload-container"]} ref={canvasHolderRef}>
            <canvas className={mapEditorStyles["texture-upload-preview-canvas"]} ref={canvasRef}>Cannot Preview</canvas>
            <input className={mapEditorStyles["texture-file-import"]} type="file" onChange={onTileCreatorTextureImport} />
        </div>
    )
}

export default TextureUpload