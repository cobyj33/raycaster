export interface IHasher<T> {
    hash(toHash: T): string;
}