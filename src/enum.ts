// prettier-ignore
/**
 * Creates a union of mutually exclusive, discriminable variants.
 * Variants with a value are wrapped in a truthy { value: ... } box.
 * Variants without a value (`undefined`) must also be truthy as `true`.
 *
 * @example
 * ```
 * Enum<{ A: string; B: number; C: undefined }>
 * -> | { A: { value: string }; B?: never; C?: never; }
 *    | { A?: never; B: { value: number }; C?: never; }
 *    | { A?: never; B?: never; C: true; }
 * ```
 */
export type Enum<T extends Record<string, unknown>> = {
	[K in keyof T]:
		& { [M in K]: T[K] extends undefined ? true : { value: T[K] } }
		& { [M in Exclude<keyof T, K>]?: never };
}[keyof T];

export namespace Enum {
	export type Infer<T extends object, K extends keyof T> = T extends Record<
		K,
		infer R
	>
		? R extends { value: infer V }
			? V
			: undefined
		: never;
}
