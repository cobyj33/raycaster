export interface IEqualityComparer<T> {
    equals(first: T, second: T): boolean;
}