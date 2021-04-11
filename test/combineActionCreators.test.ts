import createStore from "../src/createStore";
import combineActionCreators from "../src/combineActionCreators";

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

describe('测试 combineActionCreators', () => {
  it('一个 actionCreator', () => {
    const store = createStore(reducer, 1)

    // 合并一个函数
    const actionCreator = (offset: number) => ({type: 'increment', payload: offset})
    const combinedCreators = combineActionCreators(actionCreator, store.dispatch) as ActionCreator<any>

    combinedCreators(100)

    // 100 + 1
    expect(store.getState()).toEqual(101)
  })
  it('多个 actionCreator', () => {
    const store = createStore(reducer, 1)

    const combinedCreators = combineActionCreators({
      add: (offset: number) => ({type: 'increment', payload: offset}),
      minus: (offset: number) => ({type: 'decrement', payload: offset}),
    }, store.dispatch) as ActionCreatorsMapObject

    combinedCreators.add(100)
    combinedCreators.minus(2)

    // 1 + 100 - 2
    expect(store.getState()).toEqual(99)
  })
})
