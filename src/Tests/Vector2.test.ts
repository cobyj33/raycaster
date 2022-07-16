import { Angle } from "../classes/Data/Angle";
import { Vector2 } from "../classes/Data/Vector2"

test('vector2 addition', () => {
    const first = new Vector2(10, 5);
    const second = new Vector2(12, 8);
    expect(first.add(second)).toMatchObject<Vector2>(new Vector2(22, 13));
})

test('vector2 subtraction', () => {
    const first = new Vector2(10, 5);
    const second = new Vector2(12, 8);
    expect(first.subtract(second)).toMatchObject<Vector2>(new Vector2(-2, -3));
})

test('vector2 scaling', () => {
    const first = new Vector2(10, 5);
    expect(first.scale(2.5)).toMatchObject<Vector2>(new Vector2(25, 12.5));
})

test('vector2 rotation row', () => {
    const first = new Vector2(10, 5);
    expect(first.rotate(Angle.fromDegrees(30)).row).toBeCloseTo(6.16, 2);
})

test('vector2 rotation col', () => {
    const first = new Vector2(10, 5);
    expect(first.rotate(Angle.fromDegrees(30)).col).toBeCloseTo(9.33, 2);
})

test('vector2 distance', () => {
    const first = new Vector2(243, -754);
    const second = new Vector2(-902.4, 435.98);
    expect(Vector2.distance(first, second)).toBeCloseTo(1651.664, 2);
})

test('vector2 toLength row', () => {
    const first = new Vector2(8, 5);
    expect(first.toLength(20).col).toBeCloseTo(10.599, 2);
})

test('vector2 toLength col', () => {
    const first = new Vector2(8, 5);
    expect(first.toLength(20).row).toBeCloseTo(16.959, 2);
})

test('vector2 toLength', () => {
    expect(new Vector2(123, -74).toLength(55).length).toBeCloseTo(55, 1);
})

test('vector2 length', () => {
    const vector = new Vector2(8, 5);
    expect(vector.length).toBeCloseTo(Math.sqrt(89), 2);
})

