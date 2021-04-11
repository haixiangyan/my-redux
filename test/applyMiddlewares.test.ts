import createStore from "../src/createStore";
import applyMiddlewares from "../src/applyMiddlewares";

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return state + action.payload
    case 'decrement':
      return state - action.payload
    default:
      return state
  }
}

describe('测试 applyMiddlewares', () => {
  it('3 个中间件', () => {
    const mockFn1 = jest.fn((store) => dispatch => action => {
      console.log('mockFn 1 before')
      const result = dispatch(action)
      console.log('mockFn 1 after')
      return result
    })
    const mockFn2 = jest.fn((store) => dispatch => action => {
      console.log('mockFn 2 before')
      const result = dispatch(action)
      console.log('mockFn 2 after')
      return result
    })
    const mockFn3 = jest.fn((store) => dispatch => action => {
      console.log('mockFn 3 before')
      const result = dispatch(action)
      console.log('mockFn 3 after')
      return result
    })

    const store = createStore(reducer, 1, applyMiddlewares(mockFn1, mockFn2, mockFn3))

    // 1 + 2
    store.dispatch({type: 'increment', payload: 2})

    expect(store.getState()).toEqual(3)
    expect(mockFn1).toBeCalledTimes(1)
    expect(mockFn2).toBeCalledTimes(1)
    expect(mockFn3).toBeCalledTimes(1)
  })
})
