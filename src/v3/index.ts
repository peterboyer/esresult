export type Result<T = void, E = never> =
  | ({
      value: T | never;
      error: undefined;
      or(value: T): T;
      orUndefined(): T | undefined;
    } & Omit<[value: T], "toString" | "toLocaleString">)
  | {
      error: E | never;
      meta?: object;
      message?: string;
      or(value: T): never;
      orUndefined(): never | undefined;
    };

type ResultAsync<T = void, E = never> = Promise<Result<T, E>>;

//

function or(this: Result, value: unknown) {
  if (this.error) return value;
  return this.value;
}

function orUndefined(this: Result) {
  if (this.error) return undefined;
  return this.value;
}

//

export function Result<T extends { value: _T }, _T>(
  input: T
): Result<_T, never>;
export function Result<E extends { error: _E }, _E>(
  input: E
): Result<never, _E>;
export function Result<T, E>(input: { value: T } | { error: E }): Result<T, E> {
  const _never = undefined as never;

  if ("value" in input) {
    const { value } = input;
    return Object.assign(
      {
        value,
        error: _never,
        or: or as Result<T>["or"],
        orUndefined: orUndefined as Result<T>["orUndefined"],
      },
      [value] as [value: T]
    );
  }

  const { error } = input;
  return Object.assign({
    error,
    value: _never,
    or: or as Result<T>["or"],
    orUndefined: orUndefined as Result<T>["orUndefined"],
  });
}

//

// https://stackoverflow.com/a/61626123
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, false>;

// Box the unknown error instead of ruining the error signature of the Result.
export type Primitive = { primitive: unknown };

type Wrap<T> = IsAny<T> extends true
  ? Result<unknown, Primitive>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Promise<any>
  ? ResultAsync<
      IsAny<Awaited<T>> extends true ? unknown : Awaited<T>,
      Primitive
    >
  : Result<T, Primitive>;

Result.fn = function fn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any[]) => any
>(fn: F) {
  const wrapped = (...args: Parameters<F>): Wrap<ReturnType<F>> => {
    try {
      const value = fn(...args);
      const valuePromise = value as Promise<unknown>;
      if ("then" in valuePromise) {
        // @ts-expect-error Too complex.
        return valuePromise
          .then((value) => Result({ value }))
          .catch((primitive) => Result({ error: { primitive } }));
      }
      // @ts-expect-error Too complex.
      return Result({ value });
    } catch (primitive) {
      // @ts-expect-error Too complex.
      return Result({ error: { primitive } });
    }
  };
  return wrapped;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Result.from = function from<F extends (...args: never[]) => any>(fn: F) {
  const wrapped = Result.fn(fn);
  return wrapped(...([] as Parameters<F>));
};

//

import * as _result from "..";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Async = _result.ResultAsync;
}

export default Result;

export * as JSON from "./json";
