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
    store.dispatch({type: 'increment', payload: 2})
    expect(store.getState()).toEqual(3)

    // 3 - 4
    store.dispatch({type: 'decrement', payload: 4})
    expect(store.getState()).toEqual(-1)
  })
  it('测试 subscribe', () => {
    const store = createStore(reducer, 1)

    const listener = jest.fn()
    store.subscribe(listener)

    // 1 + 2
    store.dispatch({type: 'increment', payload: 2})
    expect(store.getState()).toEqual(3)
    expect(listener).toBeCalledTimes(1)
  })
  it('测试 unsubscribe', () => {
    const store = createStore(reducer, 1)

    const listener = jest.fn()
    const unsubscribe = store.subscribe(listener)

    unsubscribe()

    // 1 + 2
    store.dispatch({type: 'increment', payload: 2})
    expect(store.getState()).toEqual(3)
    expect(listener).toBeCalledTimes(0)
  })
  it('测试 replaceReducer', () => {
    const store = createStore(reducer, 1)

    const newReducer = jest.fn((state, action) => {
      return 'the new state'
    })

    store.replaceReducer(newReducer)

    store.dispatch({type: 'increment', payload: 2})
    expect(store.getState()).toEqual('the new state') // 新 reducer 的返回
    expect(newReducer).toBeCalledTimes(2) // REPLACE + increment
  })
  it('测试 observable', () => {
    const store = createStore(reducer, 1)

    const next = jest.fn((state) => state)

    const observable = store.observable()
    observable.subscribe({next}) // 订阅后 next 一下
    expect(next).toBeCalledWith(1)

    store.dispatch({type: 'increment', payload: 2}) // 又 next 一下

    expect(next).toBeCalledWith(3)
    expect(next).toBeCalledTimes(2)
  })
})
