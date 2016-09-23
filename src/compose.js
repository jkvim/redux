/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * 从右到左组合只有一个参数的函数（除了最右一个函数），最右的函数可以获得多个参数
 * 因为它提供了签名给组合之后的函数
 *
 * @param {...Function} funcs The functions to compose.
 *
 * funcs 参数是用于组合的函数
 *
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 *
 * 返回值是将参数函数从右到左组合起来的函数，例如，compose(f, g, h) 等价于返回一个
 * (...args) => f(g(h(...args)))
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  const last = funcs[funcs.length - 1]
  const rest = funcs.slice(0, -1)
  return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
}
