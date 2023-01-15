/**
 * Make the user download a file onto their computer
 * 
 * NOTE: ONLY WORKS INSIDE THE CONTEXT OF THE BROWSER, SHOULD NOT BE USED SERVER-SIDE
 * NOTE: Since we are using vite as of now, this shouldn't matter, but in case of a switch to a different framework it will become necessary
 * NOTE: Implemented as a closure containing an anchor which is used to download files through simulated clicks
 * Probably would need to be modified to work in a non-static site generator, but it does fit into the context of this program
 */
export const requestWebDownload: (data: Blob, fileName: string) => void = ( () => {
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("data-purpose", "downloading")
    document.body.appendChild(downloadAnchor);
    
    return (data: Blob, fileName: string) => {
      const url = URL.createObjectURL(data)
      downloadAnchor.href = url
      downloadAnchor.download = fileName;
      downloadAnchor.click();
    }
  })()

export function isImageFile(file: File): boolean {
  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  return validImageTypes.some(imageType => imageType === file.type)
}