function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * 将一个原本的只是 action creators 的对象，转换为同样的 key 但是 value 是封装了调用
 * dispatch 的函数, 以便于直接调用，这是一种便利的方法，你也可以直接调用
 * `store.dispatch(MyActionCreators.doSomething())`
 *
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return
 *
 * 为了方便，你也可以只传一个函数，然后获得一个返回的函数
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * actionCreators 是一个对象，它的值是 action creator 函数。通过 `import * as ` 语
 * 法获取，你也可以使用函数作为参数
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * 可以用于你的 Redux store 的 dispatch 函数
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 *
 * 该对象仿造了原来的对象，只是每个 action creator 都用 dispatch 包装起来，如果你传的
 * actionCreators 是一个函数，那么返回值将会是一个函数
 */
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
      `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  var keys = Object.keys(actionCreators)
  var boundActionCreators = {}
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}
