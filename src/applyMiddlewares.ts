import compose from './compose'

function applyMiddlewares(...middlewares: Middleware[]) {
  return (createStore) => (reducer: Reducer, preloadState) => {
    const store = createStore(reducer, preloadState)

    let dispatch = (action) => {
      throw new Error('还在构建 middlewares，不要 dispatch')
    }

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(args) // 最初使用上面的 dispatch，等下面 compose 好了，再用下面的 dispatch
    }

    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {...store, dispatch}
  }
}

export default applyMiddlewares
