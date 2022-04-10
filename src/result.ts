type BareTuple<T> = Omit<
  T,
  Exclude<keyof Array<unknown>, typeof Symbol.iterator>
>;

////////////////////////////////////////////////////////////////////////////////

interface ResultValue<T> extends BareTuple<[value: T]> {
  value: T | never;
  error: undefined;
  or(value: T): T;
  orUndefined(): T | undefined;
}

interface ResultError<T, E> {
  error:
    | {
        type: E extends [type: unknown, meta?: unknown] ? E["0"] : E;
        meta: E extends [type: unknown, meta: unknown] ? E["1"] : undefined;
        cause: unknown;
      }
    | never;
  or(value: T): never;
  orUndefined(): never | undefined;
}

export type Result<T = void, E = never> =
  | (T extends never ? never : ResultValue<T>)
  | (E extends never ? never : ResultError<T, E>);

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  export type Async<T = void, E = never> = Promise<Result<T, E>>;
}

////////////////////////////////////////////////////////////////////////////////

export function Result<VALUE>(value: VALUE): Result<VALUE, never> {
  const result = Object.create(Result.prototype);
  return Object.assign(result, { value, error: undefined }, [value]);
}

// allows array/iterator-based destructuring
Result.prototype = Object.create(Array.prototype);

// inform the array iterator that it has 1 item, not undefined
Result.prototype.length = 1;

Result.prototype.or = function or(this: Result, value: unknown) {
  if (this.error) return value;
  return this.value;
};

Result.prototype.orUndefined = function orUndefined(this: Result) {
  if (this.error) return undefined;
  return this.value;
};

////////////////////////////////////////////////////////////////////////////////

type ResultErrorTuple<
  TYPE extends string | object = string | object,
  META extends Record<string, unknown> = Record<string, unknown>
> = [type: TYPE, meta: META];

type ResultErrorOptions = { cause: unknown };

function ResultError<
  ERROR extends string | object | ResultErrorTuple<_TYPE>,
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
  ? Result.Async<IsAny<Awaited<T>> extends true ? unknown : Awaited<T>, Thrown>
  : Result<T, Thrown>;

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
          .catch((thrown) => Result.error({ thrown }));
      }
      // @ts-expect-error Too complex.
      return Result(value);
    } catch (thrown) {
      // @ts-expect-error Too complex.
      return Result.error({ thrown });
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
