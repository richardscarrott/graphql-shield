import * as Yup from 'yup'
import {
  IRuleFunction,
  IRule,
  IFragment,
  IRuleConstructorOptions,
  ILogicRule,
  ShieldRule,
  IRuleResult,
  IOptions,
  IShieldContext,
} from './types'
import { GraphQLResolveInfo } from 'graphql'
export declare class Rule implements IRule {
  readonly name: string
  private cache
  private fragment?
  private func
  constructor(
    name: string,
    func: IRuleFunction,
    constructorOptions: IRuleConstructorOptions,
  )
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
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
  /**
   *
   * @param rule
   *
   * Compares a given rule with the current one
   * and checks whether their functions are equal.
   *
   */
  equals(rule: Rule): boolean
  /**
   *
   * Extracts fragment from the rule.
   *
   */
  extractFragment(): IFragment | undefined
  /**
   *
   * @param options
   *
   * Sets default values for options.
   *
   */
  private normalizeOptions
  /**
   *
   * @param cache
   *
   * This ensures backward capability of shield.
   *
   */
  private normalizeCacheOption
  /**
   * Executes a rule and writes to cache if needed.
   *
   * @param parent
   * @param args
   * @param ctx
   * @param info
   */
  private executeRule
  /**
   * Writes or reads result from cache.
   *
   * @param key
   */
  private writeToCache
}
export declare class InputRule<Schema> extends Rule {
  constructor(
    name: string,
    schema: Yup.Schema<Schema>,
    options?: Yup.ValidateOptions,
  )
}
export declare class LogicRule implements ILogicRule {
  private rules
  constructor(rules: ShieldRule[])
  /**
   * By default logic rule resolves to false.
   */
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
  /**
   * Evaluates all the rules.
   */
  evaluate(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult[]>
  /**
   * Returns rules in a logic rule.
   */
  getRules(): ShieldRule[]
  /**
   * Extracts fragments from the defined rules.
   */
  extractFragments(): IFragment[]
}
export declare class RuleOr extends LogicRule {
  constructor(rules: ShieldRule[])
  /**
   * Makes sure that at least one of them has evaluated to true.
   */
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
}
export declare class RuleAnd extends LogicRule {
  constructor(rules: ShieldRule[])
  /**
   * Makes sure that all of them have resolved to true.
   */
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
}
export declare class RuleChain extends LogicRule {
  constructor(rules: ShieldRule[])
  /**
   * Makes sure that all of them have resolved to true.
   */
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
  /**
   * Evaluates all the rules.
   */
  evaluate(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult[]>
}
export declare class RuleRace extends LogicRule {
  constructor(rules: ShieldRule[])
  /**
   * Makes sure that at least one of them resolved to true.
   */
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
  /**
   * Evaluates all the rules.
   */
  evaluate(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult[]>
}
export declare class RuleNot extends LogicRule {
  error?: Error
  constructor(rule: ShieldRule, error?: Error)
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
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
}
export declare class RuleTrue extends LogicRule {
  constructor()
  /**
   *
   * Always true.
   *
   */
  resolve(): Promise<IRuleResult>
}
export declare class RuleFalse extends LogicRule {
  constructor()
  /**
   *
   * Always false.
   *
   */
  resolve(): Promise<IRuleResult>
}
