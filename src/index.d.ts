interface Action<T = any> {
  type: T
}

interface AnyAction extends Action {
  [extraProps: string]: any
}

type Reducer<S = any, A extends Action = AnyAction> = (state: S | undefined, action: A) => S
