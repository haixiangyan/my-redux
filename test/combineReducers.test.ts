import createStore from "../src/createStore";
import combineReducers from "../src/combineReducers";

describe('测试 combineReducers', () => {
  it('正常 combine', () => {
    const nameReducer = jest.fn(() => '111')
    const ageReducer = jest.fn(() => 222)

    const reducer = combineReducers({
      name: nameReducer,
      age: ageReducer
    })

    const store = createStore(reducer, {
      name: 'Jack',
      age: 18
    })

    store.dispatch({type: 'xxx'})

    expect(store.getState()).toEqual({
      name: '111',
      age: 222
    })
    expect(nameReducer).toBeCalled()
    expect(ageReducer).toBeCalled()
  })
})
