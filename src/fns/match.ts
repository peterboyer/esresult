import type { Result, Option, Future, PromiseState } from "./index";

type U = Option<string>;

type OmitOptional<T extends object> = Omit<
	T,
	{
		[K in keyof T]-?: {} extends Pick<T, K> ? K : never;
	}[keyof T]
>;

type N = { foo?: string; bar: number };
type NOpt = OmitOptional<N>;

type Int<T> = (T extends unknown ? (k: T) => unknown : never) extends (
	k: infer R
) => unknown
	? R
	: never;

type A = { foo: string } | { bar: number };
type AInt = Int<A>;

type B = { foo: string } | { foo?: never; bar: number }
type BOmt = B extends unknown ? OmitOptional<B> : never
type BInt = Int<BOmt>;
type BIntKeys = keyof BInt;
type BIntMapped = { [K in keyof BInt]: (arg: BInt[K]) => unknown };

type R = Result
type RInt = Int<
type RO = Int<R extends unknown ? OmitOptional<R> : never>

export function match<T extends Result<unknown>>(
	container: T,
	mapping: {
		[K in keyof TV]: (variant: NonNullable<TV[K]>) => unknown;
	}
): unknown {
	const variantKey = Object.keys(container)[0];
	const variantFn = mapping[variantKey] ?? mapping["_"];
	const value = variantFn?.(container);
	return value;
}

{
	const value = match(a, {
		Err: (a) => a,
		Ok: (b) => b,
	});
}

{
	const value = match(a, {
		Err: (Err) => Err.error,
		_: () => undefined,
	});
}
