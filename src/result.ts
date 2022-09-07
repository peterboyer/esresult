type BareTuple<T> = Omit<
  T,
  Exclude<keyof Array<unknown>, typeof Symbol.iterator>
>;

////////////////////////////////////////////////////////////////////////////////

export type Result<V = void, E = never> =
  | (V extends never ? never : Result.Value<V>)
  | (E extends never ? never : Result.Error<E, V>);

export namespace Result {
  export type Any = Result<unknown, unknown>;
  export type OrThrown<V = void> = Result<V, Result.Error.ThrownType>;

  export type Async<V = void, E = never> = Promise<Result<V, E>>;
  export namespace Async {
    export type Any = Async<unknown, unknown>;
    export type OrThrown<V = void> = Async<V, Result.Error.ThrownType>;
  }

  /** @deprecated Use Async.Any instead. */
  export type AsyncAny = Async.Any;
  /** @deprecated Use Async.OrThrown instead. */
  export type AsyncOrThrown<V = void> = Async.OrThrown<V>;

  export interface Value<V> extends BareTuple<[value: V]> {
    value: V | never;
    error: undefined;
    or(value: V): V;
    orUndefined(): V | undefined;
    orThrow(): V;
  }
  export namespace Value {
    export type Any = Value<unknown>;
  }

  /** @deprecated Use Value.Any instead. */
  export type ValueAny = Value.Any;

  export interface Error<E, V = never> {
    error:
      | {
          type: E extends [type: unknown, meta?: unknown] ? E["0"] : E;
          meta: E extends [type: unknown, meta: unknown] ? E["1"] : undefined;
          cause: unknown;
        }
      | never;
    or(value: V): never;
    orUndefined(): never | undefined;
    orThrow(): never;
  }
  export namespace Error {
    export type Any = Omit<Error<unknown>, "error"> & {
      error: { type: unknown; meta: unknown; cause: unknown };
    };
    export type Thrown<V = never> = Error<Result.Error.ThrownType, V>;
    export type ThrownType = { thrown: unknown };
  }

  /** @deprecated Use Error.Any instead. */
  export type ErrorAny = Error.Any;
  /** @deprecated Use Error.Thrown instead. */
  export type ErrorThrown<V = never> = Error.Thrown<V>;
}

////////////////////////////////////////////////////////////////////////////////

export function Result<VALUE>(value: VALUE): Result<VALUE, never> {
  const result = Object.create(Result.prototype);
  return Object.assign(result, { value, error: undefined }, [value]);
}

// allows array/iterator-based destructuring
Result.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// inform the array iterator that it has 1 item, not undefined
Result.prototype.length = 1;

Result.prototype.or = function or(this: Result.Any, defaultValue: unknown) {
  if (this.error) {
    return defaultValue;
  }
  return this.value;
};

Result.prototype.orUndefined = function orUndefined(this: Result.Any) {
  if (this.error) {
    return undefined;
  }
  return this.value;
};

Result.prototype.orThrow = function orThrow(this: Result.Any) {
  if (this.error) {
    throw new Error(`${this.error.type}`);
  }
  return this.value;
};

////////////////////////////////////////////////////////////////////////////////

export type ResultErrorTuple<
  TYPE extends string | object = string | object,
  META extends Record<string, unknown> = Record<string, unknown>
> = [type: TYPE, meta: META];

type ResultErrorOptions = { cause: unknown };

function ResultError<
  ERROR extends string | number | boolean | object | ResultErrorTuple<_TYPE>,
  _TYPE extends string | object // force error string into literal for generic
>(error: ERROR, options?: ResultErrorOptions): Result<never, ERROR> {
  const result = Object.create(Result.prototype);
  if (Array.isArray(error)) {
    const [type, meta] = error;
    return Object.assign(result, {
      error: { type, meta, cause: options?.cause },
    });
  }
  return Object.assign(result, {
    error: { type: error, meta: undefined, cause: options?.cause },
  });
}

ResultError.prototype = Object.create(Result.prototype);

Result.error = ResultError;

////////////////////////////////////////////////////////////////////////////////

function ResultErrorThrown<V = never>(thrown: unknown): Result.Error.Thrown<V> {
  return Result.error({ thrown });
}

ResultError.thrown = ResultErrorThrown;

////////////////////////////////////////////////////////////////////////////////

// https://stackoverflow.com/a/61626123
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, false>;

////////////////////////////////////////////////////////////////////////////////

type Wrap<T> = IsAny<T> extends true
  ? Result.OrThrown<unknown>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Promise<any>
  ? Result.Async.OrThrown<IsAny<Awaited<T>> extends true ? unknown : Awaited<T>>
  : Result.OrThrown<T>;

Result.fn = function fn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any[]) => any
>(fn: F) {
  const wrapped = (...args: Parameters<F>): Wrap<ReturnType<F>> => {
    try {
      const value = fn(...args);
      const valuePromise = value as Promise<unknown>;
      if (typeof valuePromise === "object" && "then" in valuePromise) {
        // @ts-expect-error Too complex.
        return valuePromise
          .then((value) => Result(value))
          .catch((thrown) => Result.error.thrown(thrown));
      }
      // @ts-expect-error Too complex.
      return Result(value);
    } catch (thrown) {
      // @ts-expect-error Too complex.
      return Result.error.thrown(thrown);
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

export default Result;
