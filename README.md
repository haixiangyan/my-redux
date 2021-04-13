# 造一个 redux 轮子

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8708739b76f94e7e86b6825c7efac988~tplv-k3u1fbpfcp-zoom-1.image)

> 文章源码：https://github.com/Haixiang6123/my-redux
> 
> 参考轮子：https://www.npmjs.com/package/redux

## 前言吐槽

Redux 应该是很多前端新手的噩梦。还记得我刚接触 Redux 的时候也是刚从 Vue 转过来的时候，觉得Redux 概念非常多，想写一个 Hello World 都难。

文档也是很难看懂，并不是看不懂英文，而是看的时候总会想：TMD在说泥🐴呢。看得出文档想手把手把新手教好，结果却是适得而反，啰嗦的排版和系统性地阐述让新手越来越蒙逼。文档还有一步令人窒息的操作：把 redux、react-redux、redux-toolkit 三个库放在一起来讲。靠，你的标题叫 redux 文档啊，就讲 Redux 不就行了嘛？搞得新手总会觉得 Redux 就是像 Vuex 一样为 React 量身订做的，其实并不是。

## Redux 和 React 的关系

Redux 和 React 根本没关系。

看 Redux 的官网开头：**["A Predictable State Container for JS Apps"](https://redux.js.org/)**。再看 Vuex 的官网开头：**["Vuex is a state management pattern + library for Vue.js applications"](https://vuex.vuejs.org/)**。

请问哪里出现了 "react" 这个单词了？

两者的定位本来就不一样：Redux 仅仅是个事件中心（事件总线，随便怎么叫），就是 for JS Apps 的。而 Vuex 除了事件中心，也是 for Vue.js applications 的。

## 解决了什么问题

为了重新认识 Redux，我们先搞清楚 Redux 到底是个啥、解决了什么问题。

简单来说：

* 创建一个事件中心，里面存一些数据，叫 `store`
* 向外提供读、写操作，叫 `getState` 和 `dispatch`，通过分发事件修改数据，叫 `dispatch(action)`
* 添加监听器，每次 dispatch 数据改了，就触发监听器，达到监听数据变化的效果，叫 `subscribe`

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aa8ee9d68f664d51a03c9d7cd593a5e5~tplv-k3u1fbpfcp-zoom-1.image)

Redux 本来就是一个超级简单的库，只是文档不知不觉把它写复杂了，搞得新手无从下手，口口相传觉得 Redux 很难、很复杂。其实 Redux 一点都不难、简单得一批。

不信？下面就带大家一起写一个完整的 Redux。

## createStore

这个函数创建一个 Object，里面存放数据，并提供读和写方法。实现如下：

```ts
function createStore(reduce, preloadedState, enhancer) {
  let currentState = preloadedState // 当前数据（状态）
  let currentReducer = reducer // 计算新数据（状态）
  let isDispatching = false // 是否在 dispatch

  // 获取 state
  function getState() {
    if (isDispatching) {
      throw new Error('还在 dispatching 呢，获取不了 state 啊')
    }
    return currentState
  }

  // 分发 action 的函数
  function dispatch(action) {
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
```

上面将数据存于 `currentState`。`getState` 返回当前数据。在 `dispatch` 里使用 `reducer` 计算新的数据（状态）从而修改 `currentState`。

上面还用 `isDispatching` 防止多重 dispatch 情况下操作同一资源的问题。

假如别人不给你传 `preloadedState`，那 `currentState` 初始时就会为 `undefuned` 了呀，`undefined` 作为 state 是不行的。为了解决这个问题，可以在 `createStore` 的时候直接 dispatch 一个 action，这个 action 不命中所有 reducer 里的 case，那么 `reducer` 都返回初始值，以此达到初始化 state 的目的，这也是为什么在 `reducer` 里的 switch-case 的 default 一定要返回 state 而不是啥都不处理。

```ts
// 生成随机字符串，注意这里的 toString(36) 的 36 是基数
const randomString = () => Math.random().toString(36).substring(7).split('').join('.')

const actionTypes = {
  INIT: `@@redux/INIT${randomString()}`, // 为了重名，追加随机字符串
}

function createStore(reduce, preloadedState, enhancer) {
  ...

  // 获取 state
  function getState() {
    ...
  }

  // 分发 action 的函数
  function dispatch(action) {
    ...
  }

  // 初始化
  dispatch({type: actionTypes.INIT})

  return {
    getState,
    dispatch
  }
}
```

然后就可以用我们的 Redux 啦~

```ts
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

const store = createStore(reducer, 1) // 1，不管有没有初始值，都会 dispatch @@redux/INIT 来初始化 state

store.dispatch({ type: 'increment', payload: 2 }) // 1 + 2

console.log(store.getState()) // 3
```

## isPlainObject 和 kindOf

Redux 对 action 是有要求的，一定要是普通对象。所以我们还要需要判断一下，如果不是普通对象，就抛出错误并说明 action 此时的类型。

```ts
// 分发 action 的函数
function dispatch(action: A) {
  if (!isPlainObject(action)) { // 是不是纯对象
    throw new Error(`不是纯净的 Object，是一个类似 ${kindOf(action)} 的东西`) // 不是，是一个类似 XXX 的东西
  }
  ...
}
```

这里的 `isPlainObject` 和 `kindOf` 都是可以从 npm 里的 [is-plain-object](https://www.npmjs.com/package/is-plain-object) 和 [kind-of](https://www.npmjs.com/package/kind-of) 获得。这两个包实现都很简单。是不是会觉得：啊？就这？就这么小的包都有几万的下载量？？？我自己实现也行啊。没错，前端开发就是这么无聊，写这么小的包都能一炮而红，只难当年还不会 JS 没能夺得先机 😢。

这里我们用 npm  包，自己实现一波吧：

首先是 `isPlainObject`，一般来说通过判断 `typeof obj === 'object'` 就可以了，但是 `typeof  null` 也是 object，这是因为最初实现 JS 的时候，用 **type** 和 **value** 表示 JS 的值，当 `type === 0` 时表示是 Object，而当初 `null` 的地址又为 `0x00` 所以 **null** 的 type 一直是 0，因此 `typeof null === null`，可以 [参考这里](https://stackoverflow.com/questions/18808226/why-is-typeof-null-object)。 另一个点是原型键只有一层。

```ts
const isPlainObject = (obj: any) => {
  // 检查类型
  if (typeof obj !== 'object' || obj === null) return false

  // 检查是否由 constructor 生成
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

export default isPlainObject
```

另一个函数 `kindOf` 实现就繁琐多了，除了要判断一些简单的 typeof 值，还要判断 Array, Date, Error 等多种对象。

```ts
const isDate = (value: any) => { // 是不是 Date
  if (value instanceof Date) return true
  return (
    typeof value.toDateString === 'function' &&
    typeof value.getDate === 'function' &&
    typeof value.setDate === 'function'
  )
}

const isError = (value: any) => { // 是不是 Error
  if (value instanceof Error) return true
  return (
    typeof value.message === 'string' &&
    value.constructor &&
    typeof value.constructor.stackTraceLimit === 'number'
  )
}

const getCtorName = (value: any): string | null => { // 获取
  return typeof value.constructor === 'function' ? value.constructor.name : null
}

const kindOf = (value: any): string => {
  if (value === void 0) return 'undefined'
  if (value === null) return 'null'

  const type = typeof value
  switch (type) { // 有字面意思的值
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function':
      return type
  }

  if (Array.isArray(value)) return 'array' //是不是数组
  if (isDate(value)) return 'date' // 是不是 Date
  if (isError(value)) return 'error' // 是不是 Error

  const ctorName = getCtorName(value)
  switch (ctorName) { // 构造函数中读取类型
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return ctorName
  }

  return type
}
```

上面两个函数在学习 Redux 并不是很重要，不过可以我们提供实现这两个工具函数的一些灵感，下次再次使用时我们也可以直接手写出来。

## replaceReducer

`replaceReducer` 这个函数别说用了，估计没多少人听说过。在 Code Spliting 的时候才会用到。比如打包出来有 2 个 JS，第一个先加载了 reducer，第二个加载新的 reducer，这里可以用 `combineReducers` 去完成合并。

```ts
const newRootReducer = combineReducers({
  existingSlice: existingSliceReducer,
  newSlice: newSliceReducer
})

store.replaceReducer(newRootReducer)
```

现在有太多做动态模块、代码分割的库帮我们做了这些事情了，所以我们没多大机会用到这个 API。

实现上也很简单，就是把原来的 `reducer` 替换掉就可以了。

```ts
const actionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`
}

function createStore(reducer, preloadedState, enhancer) {
  ...
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer

    dispatch({type: actionTypes.REPLACE} as A) // 重新初始化状态

    return store
  }
  ...
}
```

上面除了直接替换，还 dispatch 了 `@@redux/REPALCE` 这个 action。把当前状态都重置了。

## subscribe

刚刚说到 Redux 需要监听数据的变化，非常 Easy ~ 可以在 dispatch 的时候触发所有监听器。

```js
function createStore(reducer, preloadedState, enhancer) {
  let currentState = preloadedState
  let currentReducer = reducer
  let currentListeners = [] // 当前监听器
  let nextListeners = currentListeners // 临时监听器集合
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
    if (!isPlainObject(action)) {
      throw new Error(`不是纯净的 Object，是一个类似 ${kindOf(action)} 的东西`)
    }

    if (isDispatching) {
      throw new Error('还在 dispatching 呢，dispatch 不了啊')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    listeners.forEach(listener => listener()) // 全部执行一次

    return action
  }

  // 将 nextListeners 作为临时 listeners 集合
  // 防止 dispatching 时出现的一些 bug
  function ensureCanMutateNextListeners() {
    if (nextListeners !== currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 订阅
  function subscribe(listener: () => void) {
    if (isDispatching) {
      throw new Error('还在 dispatching 呢，subscribe 不了啊')
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener) // 添加监听器

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error('还在 dispatching 呢，unsubscribe 不了啊')
      }

      isSubscribed = false

      ensureCanMutateNextListeners()

      // 去掉当前监听器
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

  // 初始化
  dispatch({type: actionTypes.INIT})

  return {
    getState,
    dispatch,
    subscribe,
  }
}
```

上面有几个点要注意：
`currentListeners` 用于执行监听器，`nextListeners` 作为临时监听器的存放数组用于增加和移除监听器。弄两个数组是为了防止修改数组数组时出现一些奇奇怪怪的 Bug，和上面用 `isDispatching` 解决操作同一资源的问题是差不多的。

`subscribe` 的返回值为 `unsubscribe` 函数，这一是种很常用的编码设计：如果一个函数有 side-effect，那么返回值最好就是取消 side-effect 的函数，例如 `useEffect` 里的函数。

可能有人会问如果 subscribe 很多次，第一次的 `unsubscribe` 里的 `listener` 还是第一次的 listener 么？这是肯定的，因为 `listener` 和 `unsubscribe` 构成了闭包，每次的 `unsubscribe` 一直会引用那一次的 `listener`，`listener` 不会被销毁。

使用的例子如下：

```ts
const store = createStore(reducer, 1)

const listener = () => console.log('hello')

const unsubscirbe = store.subscribe(listener)

// 1 + 2
store.dispatch({ type: 'increment', payload: 2 }) // 打印 "hello"

unsubscribe()

// 3 + 2
store.dispatch({ type: 'increment', payload: 2 }) // 不会打印 "hello"
```

## observable

observable 是 [tc39](https://github.com/tc39/proposal-observable) 提出的概念，表示一个可被观察的东西，里面也有一个 `subscribe` 函数，不同的是传入的参数为 `Observer`，这个 `Observer` 需要有一个 `next` 函数，将当前状态生成下一个状态。

刚刚已经实现 store 数据的监听了，那 store 也可以看作为一个可被观察的东西。我们弄一个函数就叫 `observable`，返回内容即为上面的 `observable` 的实现：

```js
const $$observable = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

export default $$observable


function createStore<S, A extends Action>(reducer preloadedState, enhancer) {
  ...
  // 支持 observable/reactive 库
  function observable() {
    const outerSubscribe = subscribe

    return {
      subscribe(observer: unknown) {
        function observeState() {
          const observerAsObserver = observer
          if (observerAsObserver.next) {
            observerAsObserver.next(getState())
          }
        }

        observeState() // 获取当前 state
        const unsubscribe = outerSubscribe(observeState)
        return {unsubscribe}
      },
      [$$observable]() {
        return this
      }
    }
  }
  ...
}
```

可以像下面这样去用：

```ts
const store = createStore(reducer, 1)

const next = (state) => state + 2 // 获取下一个状态的函数

const observable = store.observable()

observable.subscribe({next}) // 订阅后 next 一下：1 + 2

store.dispatch({type: 'increment', payload: 2}) // 1 + 2 + 3
```

从上面可以看出，next 的效果就是一个累加的效果。一般人也用不到上面的特性，主要都是别的库会用到，比如 [redux-observable 这个轮子](https://redux-observable.js.org/)。

## applyMiddlewares

现在 `createStore` 已经完成差不多啦，还有第三个参数 `enhancer` 没有用到。这个函数主要用于增强 `createStore` 的。在 `createStore` 里直接传入当前 `createStore`，enhance 之后返回一个船新的 `createStore`，再传入原来的 `reducer` 和 `preloadedState` 生成 store：

```ts
function createStore<S, A extends Action>(reducer, preloadedState, enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer, preloadedState)
  }
  ...
}
```

`enhancer` 函数有很多种实现方式，其中最常见，也是官方提供的就是 `applyMiddlewares` 这个增强函数。它的目的是通过多种中间件来增强 `dispatch`，而 `dispatch` 又是 store 里的一员，相当于把 `store` 增强了，因此这个函数是个 enhancer。

在实现 `applyMiddlewares` 之前，我们要弄清楚中间件这个概念是怎么来的呢？又是如何增强 `dispatch` 的呢？为啥要用 `applyMiddlewares` 这个 enhancer 呢？

先从一个简单的例子说起：假如现在我们想在每次 dispatch 后都要 `console.log` 一下，最简单的方法：直接把 dispatch 改掉：

```ts
let originalDispatch = store.dispatch
store.dispatch = (action) => {  
    let result = originalDispatch(action)  
    console.log('next state', store.getState())  
    return result
}
```

**需要注意的是 dispatch 是一个传入 action 并返回 action 的函数，因此这里要将 result 返回出去。**

那假如我们再加个 Logger 2 呢？可能会是这样：

```ts
const logger1 = (store) => {
    let originalDispatch = store.dispatch
    
    store.dispatch = (action) => {
        console.log('logger1 before')
        let result = originalDispatch(action) // 原来的 dispatch
        console.log('logger 1 after')
        return result
    }
}

const logger2 = (store) => {
    let originalDispatch = store.dispatch
    
    store.dispatch = (action) => {
        console.log('logger2 before')
        let result = originalDispatch(action) // logger 1 的返回函数
        console.log('logger2 after')
        return result
    }
}

logger1(store)
logger2(store)

// logger2 before -> logger1 before -> dispatch -> logger1 after -> logger2 after
store.dispatch(...)
```

**上面的 logger1 和 logger 2 就叫做中间件，它们可以拿到上一次的 `store.dispatch` 函数，然后一顿操作生成新的 `dispatch`，再赋值到 `store.dispatch` 来增强 `dispatch`。**

值得注意的点是，虽然先执行 logger1 再执行 logger2，但是 dispatch 时会以
```
logger2 before -> logger1 before -> dispatch -> logger1 after -> logger2 after
```
**“倒叙”** 的方式来执行中间件的内容。

如果有更多的中间件，可以用数组存起来。初始化也不能像上面那样跑脚本那样初始化了，可以把初始化封装为一个函数，就叫 `applyMiddlewares` 吧：

```ts
function applyMiddleware(store, middlewares) {
    middlewares = middlewares.slice()   // 浅拷贝数组 
    middlewares.reverse() // 反转数组

    // 循环替换dispatch   
    middlewares.forEach(middleware => store.dispatch = middleware(store))
}
```

刚刚提到如果正序初始化中间件，会出现“倒序”执行 dispatch 的情况，所以这里要做中间件数组的反转。而 `reverse` 会改变原数组，因此开头要做一次数组的浅拷贝。

上面的写法有一个问题：在 forEach 里直接改变 store.dispatch 会产生 side-effect。遵循函数式的思路，我们应该生成好一个最终的 dispatch，再赋值到 store.dispatch 上。

怎么生成最终 dispatch 呢？参考 dispatch 的传入 action 返回 action 的思路，我们也可以弄一个传入旧 dispatch 返回新 dispatch 的函数嘛。比如：

```ts
const dispatch1 = (dispatch) => {...}
const dispatch2 = (dispatch1) => {...}
const dispatch3 = (dispatch2) => {...}
...
```

但是这样 store 就传不进来了，不怕，合理运用柯里化可以完美解决我们的问题：

```ts
const logger1 => (store) => (next) => (action) => {
    console.log('logger1 before')
    let result = originalDispatch(action)
    console.log('logger 1 after')
    return result
}

const logger2 => (store) => (next) => (action) => {
    console.log('logger2 before')
    let result = originalDispatch(action)
    console.log('logger2 after')
    return result
}

function applyMiddleware(store, middlewares) {
    // 初始的 dispatch
    let dispatch = (action) => {
      throw new Error('还在构建 middlewares，不要 dispatch')
    }

    middlewares = middlewares.slice() // 浅拷贝数组 
    middlewares.reverse() // 反转数组

    const middlewareAPI = {
      getState: store.getState,
      // 这里先用初始的 dispatch，防止在构建过程中 dispatch 的情况
      // 如果直接用上面 dispatch 会有闭包的问题，构建的时候都会指向初始时的 dispatch，可能会出现一些奇奇怪怪的 Bug
      // 因此这里用了新生成的函数
      dispatch: (...args) => dispatch(args)
    }

    // 怎么生成最终的 dispatch 呢？
    const xxx = middlewares.map(middleware => middleware(middlewareAPI))
    ...
}
```

为了像上面套娃般地生成新函数，需要用到 `reduce` 函数来将数组里每个函数进行头接尾尾接头的操作，这样的操作称为 `compose`：

```ts
function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return (arg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((prev, curt) => (...args: any) => prev(curt(...args)))
}
```

将中间件一个个传入 `compose(logger1, logger2)` 时，就会出现：

```
logger1(
  logger1 before
  logger2(
    logger2 before
    dispatch -> 最原始的 dispatch
    logger2 after
  )
  logger2 after
)
```

的结构。这就是 Redux 最厉害的地方了，对中间件的处理十分的优雅，而且使用 `reducer` 还改变了函数的执行顺序连上面的 `reverse` 都不需要了。

整理一下上面的改动，再把 `applyMiddlewares` 写成 enhancer 的写法：

```ts
function applyMiddlewares(...middlewares: Middleware[]) {
  return (createStore) => (reducer: Reducer, preloadState) => {
    const store = createStore(reducer, preloadState)

    let dispatch = (action) => {
      throw new Error('还在构建 middlewares，不要 dispatch')
    }

    const middlewareAPI: MiddlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(args)
    }

    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {...store, dispatch}
  }
}
```

到了这一步，你已经掌握了 Redux 的精髓中的精髓了。剩下的就是一些“杂鱼”函数了。

## combineReducers

一个非常无聊的函数，仅仅将一堆的 reducer 合并一个 reducer 而已。比如：

```ts
const nameReducer = () => '111'
const ageReducer = () => 222

const reducer = combineReducers({
  name: nameReducer,
  age: ageReducer
})

const store = createStore(reducer, {
  name: 'Jack',
  age: 18
})

store.dispatch({type: 'xxx'}) // state => {name: '111', age: 222}
```

怎么合并呢？简单得雅痞：

```ts
function combineReducers(reducers: ReducerMapObject) {
  return function combination(state, action: AnyAction) {
    let hasChanged = false
    let nextState = {}
    Object.entries(finalReducers).forEach(([key, reducer]) => {
      const previousStateForKey = state[key] // 以前的状态
      const nextStateForKey = reducer(previousStateForKey, action) // 更新为现在的状态

      if (typeof nextStateForKey === 'undefined') {
        throw new Error('状态不能是 undefined 啊')
      }

      nextState[key] = nextStateForKey // 设置最新状态
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey // 改了没有啊？
    })

    // reducer 的 key 的数目和 state 的 key 的数目是否一致
    hasChanged = hasChanged || Object.keys(finalReducers).length === Object.keys(state).length

    return hasChanged ? nextState : null
  }
}
```

本质上就是把 reducerMapObject 里每个 reducer 都执行一遍，拿到新 state 更新对应 key 下的 state。当然，Redux 里的对这个函数的实现也没这么简单，它还做了很多异常情况的处理，如检查 reducer 到底是不是合法的 reducer。那啥是合法的 reducer 啊？答：找不到状态时不返回 `undefined` 就合法。

```ts
const randomString = () => Math.random().toString(36).substring(7).split('').join('.')

const actionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}

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
```

通过 dispatch `@@redux/INIT` 和 `@@redux/PROBE_UNKNOWN_ACTION` 来判断不命中 reducer 里的 case 时有没有返回 `undefuned`。当然还检查了 state 啊、action 啊这些东西的合法性：

```ts
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
    return '都说了 action 要是普通的 Object 了，还传一些乱七八糟的东西进来？？'
  }

  if (action.type === actionTypes.REPLACE) return // 因为 replaceReducer，所以这个 reducer 作废了

  // 收集 reducerMapObject 里不存在的 key
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  )
  unexpectedKeys.forEach(unexpectedKey => unexpectedKeyCache[unexpectedKey] = true)

  if (unexpectedKeys.length > 0) {
    return `下面这些 Key 都不在 state 上：${unexpectedKeys.join(', ')}`
  }
}
```

这里的 `unexpectedKeyCache` 是一个 Map，如果某个子 state 有错，则设置为 `true`，这个 Map 是为了防止多次告警所做的缓存。

再次更新一下 `combineReducers`：

```ts
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
```

## combineActionCreators

更无聊的一个函数：仅仅把多个 action creator 执行，返回一些 `() => dispatch(actionCreator(xxx))` 的函数，比如：

```ts
const store = createStore(reducer, 1)

const combinedCreators = combineActionCreators({
  add: (offset: number) => ({type: 'increment', payload: offset}), // 加法 actionCreator
  minus: (offset: number) => ({type: 'decrement', payload: offset}), // 减法 actionCreator
}, store.dispatch)

combinedCreators.add(100)
combinedCreators.minus(2)
```

主要的“好处”是返回的 `combinedCreators` 里直接 `.add(100)`，这里的 `.add(100)` 可以不用感知 `dispatch` 的存在。

具体实现如下：

```ts
// 绑定一个 actionCreator
function bindActionCreator(actionCreator, dispatch) {
  return function (this: any, ...args: any[]) {
    return dispatch(actionCreator.apply(this, args))
  }
}

// 绑定多个 actionCreator
const combineActionCreators = (actionCreators, dispatch) => {
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
```

代码非常简单，仅仅帮你执行一下 actionCreator，然后 dispatch 返回的 action。

官方希望的是你在某个地方（比如父组件 combineActionCreators 了），在另外的地方（比如子组件）就不需要拿到 `dispatch` 函数就可以直接 dispatch action。

理想很好，**但是这个功能的前提是要有定义好 actionCreator，一般来说没人会花时间定义 actionCreator，都是直接 dispatch。**

## 总结

上面已经实现整个 [redux](https://www.npmjs.com/package/redux) 里所有的 API 了，基本上是一模一样的，没有偷工减料。

当然，有一些细节，比如判断参数是不是函数，是不是 undefined 是没有做的。为了不写起来太长，比如影响阅读体验，TS 类型也是简单定义，很多函数签名的声明也没有弄。不过这些并不太重要，类型的判断完全可以交给 TS 去做就好了，而 TS 的类型无需太多纠结，毕竟这不是 TS 教程嘛 😆

总结一下，我们都干了什么：

* 实现一个事件总线 + 数据（状态）中心
  * `getState` 获取数据（状态）
  * `dispatch(action)` 修改数据（状态）
  * `subscribe(listener)` 添加修改数据时的监听器，只要 `dispatch` 所有监听器依次触发
  * `replaceReducer` 用新 reducer 替换旧 reducer，一般人用不了，忘了吧
  * `observable` 为了配合 [tc39](https://github.com/tc39/proposal-observable) 搞的，准确地说是为了配合 RxJS 搞的。一般人用不起，忘了吧
  * `enhancer` 传入已有 `createStore` 一通乱搞后返回增强后的 `createStore`，最最最常见的 enhancer 为 `applyMiddlewares`。一般人只会用 `applyMiddlewares`，记住这个就可以了
* 实现 `applyMiddlewares`，将一堆中间件通过 `compose` 组合起来，执行过程为“洋葱圈”模型。其中中间件的作用是为了增强 dispatch，在 dispatch 前后会做一些事情
* 实现 `compose`，原理为将一堆入参为旧 dispatch，返回新 dispatch 的函数数组，使用 `Array.reduce` 组合，变成 `mid1(mid2(mid3()))` 无限套娃的形式
* 实现 `combineReducers`，主要作用是将多个 reducer 组件成一个新 reducer，执行 dispatch 后，所有 map 里的 reducer 都会被执行。当你用到了多个子状态 `Slice` 时会用到，别的场景忘了吧
* `combineActionCreators`，将多个 actionCreators 都执行一遍，并返回 `() => dispatch(actionCreator())` 这样的函数。这个直接忘了吧

看到这里，是不是觉得 Redux 其实并没有想象中那么的复杂，所有的“难”，“复杂”只是自己给自己设置的，硬刚源码才能战胜恐惧 👊
