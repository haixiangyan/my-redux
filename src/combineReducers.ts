import actionTypes from "./utils/actionTypes";
import isPlainObject from "./utils/isPlainObject";

function assertReducerShape(reducers: ReducerMapObject) {
  Object.values(reducers).forEach(reducer => {
    const initialState = reducer(undefined, {type: actionTypes.INIT})
    if (typeof initialState === 'undefined') {
      throw new Error('最开始 dispatch 后状态不能为 undefined')
    }

    const randomState = reducer(undefined, {type: actionTypes.PROBE_UNKNOWN_ACTION})
    if (typeof randomState === 'undefined') {
      throw new Error('乱 dispatch 后的状态也不能是 undefined')
    }
  })
}

function getUnexpectedStateShapeWarningMessage(
  inputState: object,
  reducers: ReducerMapObject,
  action: Action,
  unexpectedKeyCache: {[key: string]: true}
) {
  if (Object.keys(reducers).length === 0) {
    return '都没有 reducer 还 combine 个啥呀'
  }

  if (!isPlainObject(action)) {
    return '都说了 action 要是纯净的 Object 了，还传一些乱七八糟的东西进来'
  }

  if (action.type === actionTypes.REPLACE) return // 因为 replaceReducer，所以这个 reducer 作废了

  // 收集 map 里不存在的 key
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )
  unexpectedKeys.forEach(unexpectedKey => unexpectedKeyCache[unexpectedKey] = true)

  if (unexpectedKeys.length > 0) {
    return `下面这些 Key 都不在 state 上：${unexpectedKeys.join(', ')}`
  }
}

function combineReducers(reducers: ReducerMapObject) {
  // 检查是否为函数
  let finalReducers: ReducerMapObject = {}
  Object.entries(reducers).forEach(([key, reducer]) => {
    if (typeof reducer === 'function') {
      finalReducers[key] = reducer
    }
  }, {})

  let shapeAssertionError: Error
  try {
    // 检查 reducer 返回值是否有 undefined
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  // 用于收集状态不存在的 key
  let unexpectedKeyCache: {[key: string]: true} = {}

  return function combination(state, action: AnyAction) {
    if (shapeAssertionError) throw shapeAssertionError

    const warningMessage = getUnexpectedStateShapeWarningMessage(
      state,
      finalReducers,
      action,
      unexpectedKeyCache
    )

    if (warningMessage) {
      console.log(warningMessage)
    }

    let hasChanged = false
    let nextState = {}
    Object.entries(finalReducers).forEach(([key, reducer]) => {
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)

      if (typeof nextStateForKey === 'undefined') {
        throw new Error('状态不能是 undefined 啊')
      }

      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    })

    // reducer 的 key 的数目和 state 的 key 的数目是否一致
    hasChanged = hasChanged || Object.keys(finalReducers).length === Object.keys(state).length

    return hasChanged ? nextState : null
  }
}

export default combineReducers
