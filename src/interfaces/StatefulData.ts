type GenericType<T> = T;
export interface StatefulData<T> extends GenericType<[T, React.Dispatch<React.SetStateAction<T>>]> {
    [Symbol.iterator](): IterableIterator<T | React.Dispatch<React.SetStateAction<T>>>
}