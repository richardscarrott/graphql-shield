'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.deny = exports.allow = exports.not = exports.or = exports.race = exports.chain = exports.and = exports.inputRule = exports.rule = void 0
const Yup = require('yup')
const rules_1 = require('./rules')
/**
 *
 * @param name
 * @param options
 *
 * Wraps a function into a Rule class. This way we can identify rules
 * once we start generating middleware from our ruleTree.
 *
 * 1.
 * const auth = rule()(async (parent, args, ctx, info) => {
 *  return true
 * })
 *
 * 2.
 * const auth = rule('name')(async (parent, args, ctx, info) => {
 *  return true
 * })
 *
 * 3.
 * const auth = rule({
 *  name: 'name',
 *  fragment: 'string',
 *  cache: 'cache',
 * })(async (parent, args, ctx, info) => {
 *  return true
 * })
 *
 */
exports.rule = (name, options) => (func) => {
  if (typeof name === 'object') {
    options = name
    name = Math.random().toString()
  } else if (typeof name === 'string') {
    options = options || {}
  } else {
    name = Math.random().toString()
    options = {}
  }
  return new rules_1.Rule(name, func, {
    fragment: options.fragment,
    cache: options.cache,
  })
}
/**
 *
 * Constructs a new InputRule based on the schema.
 *
 * @param schema
 */
exports.inputRule = (name) => (schema, options) => {
  if (typeof name === 'string') {
    return new rules_1.InputRule(name, schema(Yup), options)
  } else {
    return new rules_1.InputRule(Math.random().toString(), schema(Yup), options)
  }
}
/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
exports.and = (...rules) => {
  return new rules_1.RuleAnd(rules)
}
/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
exports.chain = (...rules) => {
  return new rules_1.RuleChain(rules)
}
/**
 *
 * @param rules
 *
 * Logical operator and serves as a wrapper for and operation.
 *
 */
exports.race = (...rules) => {
  return new rules_1.RuleRace(rules)
}
/**
 *
 * @param rules
 *
 * Logical operator or serves as a wrapper for or operation.
 *
 */
exports.or = (...rules) => {
  return new rules_1.RuleOr(rules)
}
/**
 *
 * @param rule
 *
 * Logical operator not serves as a wrapper for not operation.
 *
 */
exports.not = (rule, error) => {
  if (typeof error === 'string')
    return new rules_1.RuleNot(rule, new Error(error))
  return new rules_1.RuleNot(rule, error)
}
/**
 *
 * Allow queries.
 *
 */
exports.allow = new rules_1.RuleTrue()
/**
 *
 * Deny queries.
 *
 */
exports.deny = new rules_1.RuleFalse()
//# sourceMappingURL=constructors.js.map
