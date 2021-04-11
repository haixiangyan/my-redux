function bindActionCreator<A extends AnyAction = AnyAction>(actionCreator: ActionCreator<A>, dispatch: Dispatch) {
  return function (this: any, ...args: any[]) {
    return dispatch(actionCreator.apply(this, args))
  }
}

const combineActionCreators = (actionCreators: ActionCreator<any> | ActionCreatorsMapObject, dispatch: Dispatch) => {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  const boundActionCreators: ActionCreatorsMapObject = {}
  Object.entries(actionCreators).forEach(([key, actionCreator]) => {
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  })

  return boundActionCreators
}

export default combineActionCreators
