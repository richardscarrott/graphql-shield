import { GraphQLResolveInfo } from 'graphql'
import { IMiddlewareGenerator } from 'graphql-middleware'
export declare type ShieldRule = IRule | ILogicRule
export declare class IRule {
  readonly name: string
  constructor(options: IRuleOptions)
  equals(rule: IRule): boolean
  extractFragment(): IFragment | undefined
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
}
export interface IRuleOptions {
  cache: ICache
  fragment?: IFragment
}
export declare class ILogicRule {
  constructor(rules: ShieldRule[])
  getRules(): ShieldRule[]
  extractFragments(): IFragment[]
  evaluate(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult[]>
  resolve(
    parent: object,
    args: object,
    ctx: IShieldContext,
    info: GraphQLResolveInfo,
    options: IOptions,
  ): Promise<IRuleResult>
}
export declare type IFragment = string
export declare type ICache = 'strict' | 'contextual' | 'no_cache' | ICacheKeyFn
export declare type ICacheKeyFn = (
  parent: any,
  args: any,
  ctx: any,
  info: GraphQLResolveInfo,
) => string
export declare type IRuleResult = boolean | string | Error
export declare type IRuleFunction = (
  parent: any,
  args: any,
  ctx: any,
  info: GraphQLResolveInfo,
) => IRuleResult | Promise<IRuleResult>
export declare type ICacheContructorOptions = ICache | boolean
export interface IRuleConstructorOptions {
  cache?: ICacheContructorOptions
  fragment?: IFragment
}
export interface IRuleTypeMap {
  [key: string]: ShieldRule | IRuleFieldMap
}
export interface IRuleFieldMap {
  [key: string]: ShieldRule
}
export declare type IRules = ShieldRule | IRuleTypeMap
export declare type IHashFunction = (arg: { parent: any; args: any }) => string
export declare type IFallbackErrorMapperType = (
  err: unknown,
  parent: object,
  args: object,
  ctx: IShieldContext,
  info: GraphQLResolveInfo,
) => Promise<Error> | Error
export declare type IFallbackErrorType = Error | IFallbackErrorMapperType
export interface IOptions {
  debug: boolean
  allowExternalErrors: boolean
  fallbackRule: ShieldRule
  fallbackError: IFallbackErrorType
  hashFunction: IHashFunction
}
export interface IOptionsConstructor {
  debug?: boolean
  allowExternalErrors?: boolean
  fallbackRule?: ShieldRule
  fallbackError?: string | IFallbackErrorType
  hashFunction?: IHashFunction
}
export declare function shield<TSource = any, TContext = any, TArgs = any>(
  ruleTree: IRules,
  options: IOptions,
): IMiddlewareGenerator<TSource, TContext, TArgs>
export interface IShieldContext {
  _shield: {
    cache: {
      [key: string]: IRuleResult | Promise<IRuleResult>
    }
  }
}
