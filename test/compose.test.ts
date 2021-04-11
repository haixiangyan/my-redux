import compose from "../src/compose";

describe('测试 compose', () => {
  it('没有函数', () => {
    const composed = compose()

    composed()
  })
  it('一个函数', () => {
    const mockFn = jest.fn()

    const composed = compose(mockFn)

    composed()

    expect(mockFn).toBeCalled()
  })
  it('多个函数', () => {
    const double = (x: number) => x * 2
    const square = (x: number) => x * x
    expect(compose(square)(5)).toBe(25)
    expect(compose(square, double)(5)).toBe(100)
    expect(compose(double, square, double)(5)).toBe(200)
  })
})
