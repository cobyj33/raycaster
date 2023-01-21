type GenericType<T> = T;
export interface StatefulData<T> extends GenericType<[T, React.Dispatch<React.SetStateAction<T>>]> {
    [Symbol.iterator](): IterableIterator<T | React.Dispatch<React.SetStateAction<T>>>
}

export type Cardinal = "north" | "south" | "east" | "west"

export interface Serializer<Type, JSONType> {
    serialize(data: Type): JSONType;
    deserialize(data: JSONType): Type; 
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface IClonable<T> {
    clone(): T;
}

export type IEqualityComparer<T> = (first: T, second: T) => boolean;

export interface IEquatable<T> {
    equals(other: T): boolean;
}

export interface IHasher<T> {
    hash(toHash: T): string;
}
