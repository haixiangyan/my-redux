import isPlainObject from "../../src/utils/isPlainObject";

describe('测试 isPlainObject', () => {
  it('测试多种类型', () => {
    const plainObject = {x: 1}
    expect(isPlainObject(plainObject)).toBeTruthy()

    function F() {}
    const ctorObject = new F()
    expect(isPlainObject(ctorObject)).toBeFalsy()

    expect(isPlainObject(null)).toBeFalsy()
    expect(isPlainObject(123)).toBeFalsy()
  })
})
