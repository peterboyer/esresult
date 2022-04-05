type BareTuple<T> = Omit<
  T,
  Exclude<keyof Array<unknown>, typeof Symbol.iterator>
>;

////////////////////////////////////////////////////////////////////////////////

export type Result<T = void, E = never> =
  | (T extends never
      ? never
      : {
          value: T | never;
          error: undefined;
          or(value: T): T;
          orUndefined(): T | undefined;
        } & BareTuple<[value: T]>)
  | (E extends never
      ? never
      : {
          error: [E] extends [[unknown, unknown]]
            ? { type: E[0]; meta: Omit<E[1], "$cause">; cause?: unknown }
            : { type: E; meta?: undefined; cause?: unknown } | never;
          or(value: T): never;
          orUndefined(): never | undefined;
        });

export type ResultAsync<T = void, E = never> = Promise<Result<T, E>>;

////////////////////////////////////////////////////////////////////////////////

export function Result<VALUE>(value: VALUE): Result<VALUE, never> {
  const result = Object.create(Result.prototype);
  return Object.assign(result, { value }, [value]);
}

Result.prototype.or = function or(this: Result, value: unknown) {
  if (this.error) return value;
  return this.value;
};

Result.prototype.orUndefined = function orUndefined(this: Result) {
  if (this.error) return undefined;
  return this.value;
};

////////////////////////////////////////////////////////////////////////////////

Result.error = function error<
  ERROR extends string | object,
  META extends object | undefined = undefined
>(
  error: ERROR,
  meta?: META
): Result<never, META extends undefined ? ERROR : [ERROR, META]> {
  const result = Object.create(Result.prototype);
  return Object.assign(result, { error, meta });
};

////////////////////////////////////////////////////////////////////////////////

// https://stackoverflow.com/a/61626123
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, false>;

////////////////////////////////////////////////////////////////////////////////

// Box the unknown error instead of ruining the error signature of the Result.
export type Thrown = { thrown: unknown };

type Wrap<T> = IsAny<T> extends true
  ? Result<unknown, Thrown>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Promise<any>
  ? ResultAsync<IsAny<Awaited<T>> extends true ? unknown : Awaited<T>, Thrown>
  : Result<T, Thrown>;

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
          .catch((thrown) => Result({ error: { thrown } }));
      }
      // @ts-expect-error Too complex.
      return Result({ value });
    } catch (thrown) {
      // @ts-expect-error Too complex.
      return Result({ error: { thrown } });
    }
  };
  return wrapped;
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Result.try = function from<F extends (...args: never[]) => any>(fn: F) {
  const wrapped = Result.fn(fn);
  return wrapped(...([] as Parameters<F>));
};

////////////////////////////////////////////////////////////////////////////////

import * as namespaced from "./namespaced";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Async = namespaced.ResultAsync;
}

export default Result;

export * as JSON from "./json";
