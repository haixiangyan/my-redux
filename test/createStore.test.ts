import createStore from "../src/createStore";

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

describe('测试 createStore', () => {
  it('测试 getState', () => {
    const store = createStore(reducer, 1)

    const currentState = store.getState()
    expect(currentState).toEqual(1)
  })
  it('测试 dispatch', () => {
    const store = createStore(reducer, 1)

    expect(store.getState()).toEqual(1)

    // 1 + 2
    store.dispatch({ type: 'increment', payload: 2 })
    expect(store.getState()).toEqual(3)

    // 3 - 4
    store.dispatch({ type: 'decrement', payload: 4 })
    expect(store.getState()).toEqual(-1)
  })
  it('测试 subscribe', () => {
    const store = createStore(reducer, 1)

    const listener = jest.fn()
    store.subscribe(listener)

    // 1 + 2
    store.dispatch({ type: 'increment', payload: 2 })
    expect(store.getState()).toEqual(3)
    expect(listener).toBeCalledTimes(1)
  })
  it('测试 unsubscribe', () => {
    const store = createStore(reducer, 1)

    const listener = jest.fn()
    const unsubscribe = store.subscribe(listener)

    unsubscribe()

    // 1 + 2
    store.dispatch({ type: 'increment', payload: 2 })
    expect(store.getState()).toEqual(3)
    expect(listener).toBeCalledTimes(0)
  })
})
