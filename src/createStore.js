import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
 /* Redux 私有的 action types
  * 对于任何未知的 actions，必须返回当前状态
  * 如果当前状态是未定义的，必须返回初始状态
  * 不要在你的代码中直接引用这个 action types
  */
export var ActionTypes = {
  INIT: '@@redux/INIT'
}

/**
 * Creates a Redux store that holds the state tree.
 *
 * 创建一个维护了一颗状态树的 Redux store
 *
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * 改变这个 store 的数据的唯一方法是调用它的 dispatch()
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * 你的应用中应该只有一个 store，为了说明状态树各个状态对于 action 的反应，你可能需要
 * 利用 combineReducers 将多个 reducers 组合成一个 reducer 函数
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * reducer 函数, 传入当前的状态树和需要处理的 action，返回下一个状态树。
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * preloadedState 是初始状态。你可以选择从服务端获得状态，或者是之前已经序列化的用户
 * 会话
 * 如果你使用 combineReducers 来得到根 reducer 函数，那么 preloadedState 就必须拥有
 * 和 combineReducers 一样的key
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * enhancer 函数是 store 的增强器。你可以通过第三方的中间件来获取时间旅行，持久化等能力
 * 唯一会集成到 Redux 的 store 增强器是 applyMiddleware
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 *
 * 返回一个 Redux store，你可以通过它读取 state，触发 action 和订阅变化
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // preloadedState 可以省略，使用 enhancer 作为第二个
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // store 增强器必须是一个函数，类似 applyMiddleware，store 增强器的函数签名应该是
  // (createStore) => func, 此时如果有多个 store 增强器，就可以利用 compose 进行
  // 串联
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  var currentReducer = reducer
  var currentState = preloadedState
  var currentListeners = []
  var nextListeners = currentListeners
  var isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * 读取由 store 管理的状态树
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * 添加一个变化的监听器。他会在 action 触发后进行调用，同时，状态树的某部分可能发生了
   * 变化。这时候，你可以调用 getState 来读取当前的状态树
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 你可以在监听器中调用 dispatch，但是会有以下的警告：
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 1. 这个订阅是每次调用 diapatch 之前的快照，如果你在将监听器在调用时订阅或者取消
   * 订阅，对于已经调用的 dipatch 不会有任何作用，然而，下一个 dispatch 调用，将会使用
   * 最近的订阅列表快照
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * 2. 不应该期望在监听器中看到所有的状态变化，因为在一个嵌套的 dispatch 中，监听器调
   * 用之前，状态可能已经发生了多次更新，但是，所有在 dispatch 开始之前注册的订阅者，
   * 都会被调用，并且获得最新的状态。
   *
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   *
   * listener 是每次 dispatch 都会调用的回调函数
   *
   * @returns {Function} A function to remove this change listener.
   *
   * 返回一个函数，可以去除监听器
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    // 每个 listener 有自己的 isSubscribed 状态
    var isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   * 激发一次行为，dispatch是触发改变状态的唯一方法
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * reducer 函数是用来创建 store 的， 调用的时候会传入当前的 state 和 action 作为
   * 参数，它的返回值作为状态树的下一状态，并且通知 listeners
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * redux 只实现了基本的 object 作为action， 如果想激发其它类型的action， 例如
   * Promise, Observable, thunk 或者其他的类型， 你需要封装你创建 store 的函数到对应
   * 中间件中，例如，可以参考 redux-thunk 的文档。 尽管最终中间件触发的 action 是
   * object
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * action 是一个 object 对象，代表了“什么改变了”。 最好保持 action 的序列化，这样
   * 让你记录和回放用户的会话，或者使用 redux-devtools 的时间穿梭。action 必须有 type
   * 属性，这个属性不能是 undefined，建议使用字符串常量作为 action types
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * 为了方便，返回的和你触发一样的 action
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    // isDispatching 是全局的状态
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 更新全局状态
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    var listeners = currentListeners = nextListeners
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * 给 store 替换当前的 reducer 并且计算 state
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * 当你的代码是分离的或者需要实现一个 Redux 的 hot reloading 机制时，你可能需要使
   * 用这个函数
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   *
   * 给 observable/reactive 库的协同点
   *
   * @returns {observable} A minimal observable of state changes.
   *
   * 返回一个 observable 对象，代表了最小可观察的状态变化
   *
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       *
       * 最小可观察的订阅方法
       *
       * @param {Object} observer Any object that can be used as an observer.
       * observer 是任何可以作为 observer 的对象
       *
       * The observer object should have a `next` method.
       * observer 对象应该有一个 next 方法
       *
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       *
       * 返回一个有 unsubscribe 的对象，可以从取消订阅 store 中的 observerable 并且
       * 阻止之后来自这个 observable 的值。
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        var unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  //
  // 当一个 store 创建之后， 一个 “INIT” 行为会被激发， 所以所有的 reducer 都会返回
  // 他们的最初状态，这使得状态树被有效填充
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
