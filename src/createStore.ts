function createStore<S, A extends Action>(reducer: Reducer<S, A>, preloadedState, enhancer?: Function) {
  let currentState = preloadedState as S
  let currentReducer = reducer
  let isDispatching = false

  // 获取 state
  function getState() {
    if (isDispatching) {
      throw new Error('还在 dispatching 呢，获取不了 state 啊')
    }
    return currentState
  }

  // 分发 action 的函数
  function dispatch(action: A) {
    if (isDispatching) {
      throw new Error('还在 dispatching 呢，dispatch 不了啊')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    return action
  }

  return {
    getState,
    dispatch
  }
}

export default createStore
