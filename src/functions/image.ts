

export async function getImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        }

        image.onerror = () => {
            reject(url)
        }
        image.src = url;
    })
}

// export function toBase64(image: HTMLImageElement) {
//     image.baseURI
// }