export function getImage(url: string) {
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