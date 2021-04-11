interface Action<T = any> {
  type: T
}

interface AnyAction extends Action {
  [extraProps: string]: any
}

type Reducer<S = any, A extends Action = AnyAction> = (state: S | undefined, action: A) => S

type Observer<V> = {
  next?:(value: V) => void
}

type ReducerMapObject<S = any, A extends Action = AnyAction> = {
  [K in keyof S]: Reducer<S, A>
}
