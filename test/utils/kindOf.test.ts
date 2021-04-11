import kindOf from "../../src/utils/kindOf";

describe('测试 kindOf', () => {
  it('测试多种类型', () => {
    expect(kindOf(undefined)).toEqual('undefined')
    expect(kindOf(null)).toEqual('null')
    expect(kindOf(123)).toEqual('number')
    expect(kindOf('str')).toEqual('string')
    expect(kindOf({})).toEqual('object')
    expect(kindOf([1, 2, 3])).toEqual('array')
    expect(kindOf(new Date())).toEqual('date')
    expect(kindOf(new Error())).toEqual('error')
  })
})
