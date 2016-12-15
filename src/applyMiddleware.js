import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * 创建一个 store 增强器，这个增强器可以将中间件应用于 Redux store 的 dispatch 方法。
 * 这可以很方便地处理不同任务，例如用简洁的方式表达异步 action，或者记录每个 action
 * 的 payload
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * 参考 redux-thunk 作为 Redux 中间件的例子
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * 因为中间件是潜在异步的，所以这应该是组合链中的第一个 store 增强器
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * 注意，每个中间件都会被传递 dispatch 和 getState 两个参数
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 *
 * 将要用于中间件链的中间件
 *
 * @returns {Function} A store enhancer applying the middleware.
 *
 * 返回一个应用了所有中间件的 store 增强器
 *
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    var store = createStore(reducer, preloadedState, enhancer)
    var dispatch = store.dispatch
    var chain = []

    // dispatch 使用匿名函数是为了让 dispatch 可以更新
    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action) 
    }
   
    // 此时chain 中的函数就可以看成 dispatch 的增强器，和 store 增强器是一个概念
    chain = middlewares.map(middleware => middleware(middlewareAPI))  
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
