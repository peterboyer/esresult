type Primitive = undefined | null | boolean | number | string | symbol;

/**
 * Use unknown instead of any.
 * @link https://stackoverflow.com/a/61626123
 */
export type Strict<T> = 0 extends 1 & T ? unknown : T;

/**
 * Wrap any value as an object.
 */
export type Box<T> = { value: T };

export namespace Box {
	export type InferValue<T> = T extends { value: infer R } ? R : never;
}

/**
 * Represent an output with a success and a failure variant.
 */
export type Result<T, E = true> =
	| { error: E }
	| ({ error?: never } & (T extends Primitive ? Box<T> : T));

export namespace Result {
	export type InferValue<T> = T extends { error?: never } & infer R ? R : never;
	export type InferError<T> = T extends { error: infer R } ? R : never;
}

/**
 * Represent an output with a resolved and a pending variant.
 */
export type Future<T> =
	| { pending: true }
	| ({ pending?: never } & (T extends Primitive ? Box<T> : T));

export namespace Future {
	export type InferValue<T> = T extends { pending?: never } & infer R
		? R
		: never;
}

export const orbox = <T>(value: T): T extends Primitive ? Box<T> : T =>
	// @ts-expect-error Trust.
	value === undefined ||
	value === null ||
	typeof value === "boolean" ||
	typeof value === "number" ||
	typeof value === "string" ||
	typeof value === "symbol"
		? { value }
		: value;

export const safe = <T>(
	fn: (...args: unknown[]) => T
): 0 extends 1 & T
	? Result<Box<unknown>>
	: T extends Promise<unknown>
	? Promise<Result<Box<Strict<T>>>>
	: Result<Box<Strict<T>>> => {
	let value: unknown;
	try {
		value = fn();
	} catch (error: unknown) {
		// @ts-expect-error Trust.
		return { error };
	}
	if (
		value &&
		typeof value === "object" &&
		"then" in value &&
		typeof (value as Promise<unknown>).then === "function" &&
		"catch" in value &&
		typeof (value as Promise<unknown>).catch === "function"
	) {
		// @ts-expect-error Trust.
		return (value as Promise<unknown>)
			.then((value: unknown) => ({ value }))
			.catch((error: unknown) => ({ error }));
	}
	// @ts-expect-error Trust.
	return { value };
};
