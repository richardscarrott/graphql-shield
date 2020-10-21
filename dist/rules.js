'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RuleFalse = exports.RuleTrue = exports.RuleNot = exports.RuleRace = exports.RuleChain = exports.RuleAnd = exports.RuleOr = exports.LogicRule = exports.InputRule = exports.Rule = void 0
const utils_1 = require('./utils')
const util_1 = require('util')
class Rule {
  constructor(name, func, constructorOptions) {
    const options = this.normalizeOptions(constructorOptions)
    this.name = name
    this.func = func
    this.cache = options.cache
    this.fragment = options.fragment
  }
  /**
   *
   * @param parent
   * @param args
   * @param ctx
   * @param info
   *
   * Resolves rule and writes to cache its result.
   *
   */
  async resolve(parent, args, ctx, info, options) {
    try {
      /* Resolve */
      const res = await this.executeRule(parent, args, ctx, info, options)
      if (res instanceof Error) {
        return res
      } else if (typeof res === 'string') {
        return new Error(res)
      } else if (res === true) {
        return true
      } else {
        return false
      }
    } catch (err) {
      if (options.debug) {
        throw err
      } else if (err instanceof Error) {
        return err
      } else {
        return false
      }
    }
  }
  /**
   *
   * @param rule
   *
   * Compares a given rule with the current one
   * and checks whether their functions are equal.
   *
   */
  equals(rule) {
    return this.func === rule.func
  }
  /**
   *
   * Extracts fragment from the rule.
   *
   */
  extractFragment() {
    return this.fragment
  }
  /**
   *
   * @param options
   *
   * Sets default values for options.
   *
   */
  normalizeOptions(options) {
    return {
      cache:
        options.cache !== undefined
          ? this.normalizeCacheOption(options.cache)
          : 'no_cache',
      fragment: options.fragment !== undefined ? options.fragment : undefined,
    }
  }
  /**
   *
   * @param cache
   *
   * This ensures backward capability of shield.
   *
   */
  normalizeCacheOption(cache) {
    switch (cache) {
      case true: {
        return 'strict'
      }
      case false: {
        return 'no_cache'
      }
      default: {
        return cache
      }
    }
  }
  /**
   * Executes a rule and writes to cache if needed.
   *
   * @param parent
   * @param args
   * @param ctx
   * @param info
   */
  executeRule(parent, args, ctx, info, options) {
    switch (typeof this.cache) {
      case 'function': {
        /* User defined cache function. */
        const key = `${this.name}-${this.cache(parent, args, ctx, info)}`
        return this.writeToCache(key)(parent, args, ctx, info)
      }
      case 'string': {
        /* Standard cache option. */
        switch (this.cache) {
          case 'strict': {
            const key = options.hashFunction({ parent, args })
            return this.writeToCache(`${this.name}-${key}`)(
              parent,
              args,
              ctx,
              info,
            )
          }
          case 'contextual': {
            return this.writeToCache(this.name)(parent, args, ctx, info)
          }
          case 'no_cache': {
            return this.func(parent, args, ctx, info)
          }
        }
      }
      /* istanbul ignore next */
      default: {
        throw new Error(`Unsupported cache format: ${typeof this.cache}`)
      }
    }
  }
  /**
   * Writes or reads result from cache.
   *
   * @param key
   */
  writeToCache(key) {
    return (parent, args, ctx, info) => {
      if (!ctx._shield.cache[key]) {
        ctx._shield.cache[key] = this.func(parent, args, ctx, info)
      }
      return ctx._shield.cache[key]
    }
  }
}
exports.Rule = Rule
class InputRule extends Rule {
  constructor(name, schema, options) {
    const validationFunction = (parent, args, ctx) =>
      schema
        .validate(args, options)
        .then(() => true)
        .catch((err) => err)
    super(name, validationFunction, { cache: 'strict', fragment: undefined })
  }
}
exports.InputRule = InputRule
class LogicRule {
  constructor(rules) {
    this.rules = rules
  }
  /**
   * By default logic rule resolves to false.
   */
  async resolve(parent, args, ctx, info, options) {
    return false
  }
  /**
   * Evaluates all the rules.
   */
  async evaluate(parent, args, ctx, info, options) {
    const rules = this.getRules()
    const tasks = rules.map((rule) =>
      rule.resolve(parent, args, ctx, info, options),
    )
    return Promise.all(tasks)
  }
  /**
   * Returns rules in a logic rule.
   */
  getRules() {
    return this.rules
  }
  /**
   * Extracts fragments from the defined rules.
   */
  extractFragments() {
    const fragments = this.rules.reduce((fragments, rule) => {
      if (utils_1.isLogicRule(rule)) {
        return fragments.concat(...rule.extractFragments())
      }
      const fragment = rule.extractFragment()
      if (fragment) return fragments.concat(fragment)
      return fragments
    }, [])
    return fragments
  }
}
exports.LogicRule = LogicRule
// Extended Types
class RuleOr extends LogicRule {
  constructor(rules) {
    super(rules)
  }
  /**
   * Makes sure that at least one of them has evaluated to true.
   */
  async resolve(parent, args, ctx, info, options) {
    const result = await this.evaluate(parent, args, ctx, info, options)
    if (result.every((res) => res !== true)) {
      const customError = result.find((res) => res instanceof Error)
      return customError || false
    } else {
      return true
    }
  }
}
exports.RuleOr = RuleOr
class RuleAnd extends LogicRule {
  constructor(rules) {
    super(rules)
  }
  /**
   * Makes sure that all of them have resolved to true.
   */
  async resolve(parent, args, ctx, info, options) {
    const result = await this.evaluate(parent, args, ctx, info, options)
    if (result.some((res) => res !== true)) {
      const customError = result.find((res) => res instanceof Error)
      return customError || false
    } else {
      return true
    }
  }
}
exports.RuleAnd = RuleAnd
class RuleChain extends LogicRule {
  constructor(rules) {
    super(rules)
  }
  /**
   * Makes sure that all of them have resolved to true.
   */
  async resolve(parent, args, ctx, info, options) {
    const result = await this.evaluate(parent, args, ctx, info, options)
    if (result.some((res) => res !== true)) {
      const customError = result.find((res) => res instanceof Error)
      return customError || false
    } else {
      return true
    }
  }
  /**
   * Evaluates all the rules.
   */
  async evaluate(parent, args, ctx, info, options) {
    const rules = this.getRules()
    return iterate(rules)
    async function iterate([rule, ...otherRules]) {
      if (util_1.isUndefined(rule)) return []
      return rule.resolve(parent, args, ctx, info, options).then((res) => {
        if (res !== true) {
          return [res]
        } else {
          return iterate(otherRules).then((ress) => ress.concat(res))
        }
      })
    }
  }
}
exports.RuleChain = RuleChain
class RuleRace extends LogicRule {
  constructor(rules) {
    super(rules)
  }
  /**
   * Makes sure that at least one of them resolved to true.
   */
  async resolve(parent, args, ctx, info, options) {
    const result = await this.evaluate(parent, args, ctx, info, options)
    if (result.some((res) => res === true)) {
      return true
    } else {
      const customError = result.find((res) => res instanceof Error)
      return customError || false
    }
  }
  /**
   * Evaluates all the rules.
   */
  async evaluate(parent, args, ctx, info, options) {
    const rules = this.getRules()
    return iterate(rules)
    async function iterate([rule, ...otherRules]) {
      if (util_1.isUndefined(rule)) return []
      return rule.resolve(parent, args, ctx, info, options).then((res) => {
        if (res === true) {
          return [res]
        } else {
          return iterate(otherRules).then((ress) => ress.concat(res))
        }
      })
    }
  }
}
exports.RuleRace = RuleRace
class RuleNot extends LogicRule {
  constructor(rule, error) {
    super([rule])
    this.error = error
  }
  /**
   *
   * @param parent
   * @param args
   * @param ctx
   * @param info
   *
   * Negates the result.
   *
   */
  async resolve(parent, args, ctx, info, options) {
    const [res] = await this.evaluate(parent, args, ctx, info, options)
    if (res instanceof Error) {
      return true
    } else if (res !== true) {
      return true
    } else {
      if (this.error) return this.error
      return false
    }
  }
}
exports.RuleNot = RuleNot
class RuleTrue extends LogicRule {
  constructor() {
    super([])
  }
  /**
   *
   * Always true.
   *
   */
  async resolve() {
    return true
  }
}
exports.RuleTrue = RuleTrue
class RuleFalse extends LogicRule {
  constructor() {
    super([])
  }
  /**
   *
   * Always false.
   *
   */
  async resolve() {
    return false
  }
}
exports.RuleFalse = RuleFalse
//# sourceMappingURL=rules.js.map
