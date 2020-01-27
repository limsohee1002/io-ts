/**
 * @since 3.0.0
 */
import * as C from 'fp-ts/lib/Const'
import * as S from './Schemable'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export interface JsonSchema<A> extends C.Const<unknown, A> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export function make<A>(u: unknown): JsonSchema<A> {
  return C.make(u)
}

/**
 * @since 3.0.0
 */
export function constants<A>(as: NonEmptyArray<A>): JsonSchema<A> {
  const anyOf = as.map(a => ({ enum: [a] }))
  return C.make({
    anyOf
  })
}

/**
 * @since 3.0.0
 */
export function constantsOr<A, B>(as: NonEmptyArray<A>, jsonSchema: JsonSchema<B>): JsonSchema<A | B> {
  return C.make({
    anyOf: [constants(as), jsonSchema]
  })
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const string: JsonSchema<string> = C.make({ type: 'string' })

/**
 * @since 3.0.0
 */
export const number: JsonSchema<number> = C.make({ type: 'number' })

/**
 * @since 3.0.0
 */
export const boolean: JsonSchema<boolean> = C.make({ type: 'boolean' })

/**
 * @since 3.0.0
 */
export const UnknownArray: JsonSchema<Array<unknown>> = C.make({ type: 'array' })

/**
 * @since 3.0.0
 */
export const UnknownRecord: JsonSchema<Record<string, unknown>> = C.make({ type: 'object' })

/**
 * @since 3.0.0
 */
export const Int: JsonSchema<S.Int> = C.make({ type: 'integer' })

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export function type<A>(jsonSchemas: { [K in keyof A]: JsonSchema<A[K]> }): JsonSchema<A> {
  return C.make({
    type: 'object',
    properties: jsonSchemas,
    required: Object.keys(jsonSchemas)
  })
}

/**
 * @since 3.0.0
 */
export function partial<A>(jsonSchemas: { [K in keyof A]: JsonSchema<A[K]> }): JsonSchema<Partial<A>> {
  return C.make({
    type: 'object',
    properties: jsonSchemas
  })
}

/**
 * @since 3.0.0
 */
export function record<A>(jsonSchema: JsonSchema<A>): JsonSchema<Record<string, A>> {
  return C.make({
    type: 'object',
    additionalProperties: jsonSchema
  })
}

/**
 * @since 3.0.0
 */
export function array<A>(jsonSchema: JsonSchema<A>): JsonSchema<Array<A>> {
  return C.make({
    type: 'array',
    items: jsonSchema
  })
}

/**
 * @since 3.0.0
 */
export function tuple<A, B, C, D, E>(
  jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>, JsonSchema<D>, JsonSchema<E>]
): JsonSchema<[A, B, C, D, E]>
export function tuple<A, B, C, D>(
  jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>, JsonSchema<D>]
): JsonSchema<[A, B, C, D]>
export function tuple<A, B, C>(jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>]): JsonSchema<[A, B, C]>
export function tuple<A, B>(jsonSchemas: [JsonSchema<A>, JsonSchema<B>]): JsonSchema<[A, B]>
export function tuple<A>(jsonSchemas: [JsonSchema<A>]): JsonSchema<[A]>
export function tuple(jsonSchemas: Array<JsonSchema<any>>): JsonSchema<any> {
  const len = jsonSchemas.length
  return C.make({
    type: 'array',
    items: jsonSchemas,
    minItems: len,
    maxItems: len
  })
}

/**
 * @since 3.0.0
 */
export function intersection<A, B, C, D, E>(
  jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>, JsonSchema<D>, JsonSchema<E>]
): JsonSchema<A & B & C & D & E>
export function intersection<A, B, C, D>(
  jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>, JsonSchema<D>]
): JsonSchema<A & B & C & D>
export function intersection<A, B, C>(jsonSchemas: [JsonSchema<A>, JsonSchema<B>, JsonSchema<C>]): JsonSchema<A & B & C>
export function intersection<A, B>(jsonSchemas: [JsonSchema<A>, JsonSchema<B>]): JsonSchema<A & B>
export function intersection(jsonSchemas: Array<JsonSchema<any>>): JsonSchema<any> {
  return C.make({
    allOf: jsonSchemas
  })
}

/**
 * @since 3.0.0
 */
export function sum<T extends string>(
  _tag: T
): <A>(jsonSchemas: { [K in keyof A]: JsonSchema<A[K] & Record<T, K>> }) => JsonSchema<A[keyof A]> {
  return (jsonSchemas: any) =>
    C.make({
      oneOf: Object.keys(jsonSchemas).map((k: any) => jsonSchemas[k])
    })
}

/**
 * @since 3.0.0
 */
export function union<A extends [unknown, unknown, ...Array<unknown>]>(
  jsonSchemas: { [K in keyof A]: JsonSchema<A[K]> }
): JsonSchema<A[number]> {
  return C.make({
    oneOf: jsonSchemas
  })
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const URI = 'JsonSchema'

/**
 * @since 3.0.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly JsonSchema: JsonSchema<A>
  }
}

/**
 * @since 3.0.0
 */
export const jsonSchema: S.Schemable<URI> & S.WithUnion<URI> = {
  URI,
  constants,
  constantsOr,
  string,
  number,
  boolean,
  Int,
  UnknownArray,
  UnknownRecord,
  type,
  partial,
  record,
  array,
  tuple,
  intersection,
  sum,
  union
}