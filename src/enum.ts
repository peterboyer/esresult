/**
 * Creates a union of combined, mutually exclusive variants.
 * @example
 * ```
 * Enum<{ A: { value: string } } | { B: { value: number } }>
 * -> | { A: { value: string }, B?: never }
 *    | { A?: never, B: { value: number } }
 * ```
 */
export type Enum<T extends Enum.Variant> = Either<Intersect<T>>;

export namespace Enum {
	export type Variant<TYPE extends string = string, VALUE = unknown> = Record<
		TYPE,
		VALUE extends never ? never : { value: VALUE }
	>;

	export type Infer<
		T extends Partial<Variant>,
		K extends keyof T
	> = T extends Record<K, infer R> ? R : never;

	export type InferValue<
		T extends Partial<Variant>,
		K extends keyof T
	> = T extends Record<K, { value: infer R }> ? R : never;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Create an intersection of all union members.
 * @example
 * ```
 * Intersect<{ A: string } | { B: string } | { C: string }>
 * -> { A: string, B: string, C: string }
 * ```
 */
type Intersect<T> = (T extends unknown ? (t: T) => void : never) extends (
	t: infer R
) => void
	? R
	: never;

/**
 * Create an object of T keys with never values.
 * @example
 * ```
 * Never<{ A: string, B: string, C: string }>
 * -> { A: never, B: never, C: never }
 * ```
 */
type Never<T extends object> = { [K in keyof T]: never };

/**
 * Create a union of objects from T where each key must be the only one defined.
 * @example
 * ```
 * Either<{ A: string, B: string, C: string }>
 * -> | { A: string, B?: never, C?: never }
 *    | { A?: never, B: string, C?: never }
 *    | { A?: never, B?: never, C: string }
 * ```
 */
type Either<T> = {
	[K in keyof T]: Required<Pick<T, K>> & Partial<Never<Omit<T, K>>>;
}[keyof T];
