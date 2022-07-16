import { Angle } from "../classes/Data/Angle"

test("radian conversion", () => {
    expect(Angle.fromDegrees(30).radians).toEqual( Math.PI / 6 );
})

test("degree conversion", () => {
    expect(Angle.fromRadians(Math.PI * 3 / 4).degrees).toEqual( 135 );
})