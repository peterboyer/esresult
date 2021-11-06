// Base

export interface Base<OK extends boolean> {
  ok: OK;
  is<BASE, ERROR extends "error" extends keyof BASE ? BASE["error"] : never>(
    this: BASE,
    error: ERROR
  ): boolean;
  or<BASE, VALUE extends "value" extends keyof BASE ? BASE["value"] : never>(
    this: BASE,
    defaultValue: VALUE
  ): VALUE;
  orUndefined<
    BASE,
    VALUE extends "value" extends keyof BASE ? BASE["value"] : never
  >(
    this: BASE
  ): VALUE | undefined;
}

// Ok

export interface Ok<VALUE> extends Base<true> {
  value: VALUE;
  /**
   * @internal
   * @deprecated
   */
  // ? Hack to strike "error" for intellisense.
  // TODO: Wish I could remove this without breaking .is(...) union inference.
  error?: never;
}

const Ok: Ok<undefined> = {
  ok: true,
  value: undefined,
  is() {
    return false;
  },
  or(value) {
    return (this as unknown as Ok<typeof value>).value;
  },
  orUndefined() {
    return (this as unknown as Ok<undefined>).value;
  },
};

/**
 * Creates a new `Ok` object with any given value. This is represents a
 * successful result as commonly returns by a function.
 *
 * @param value Any value you wish to return.
 * @returns A new `Ok` object using `value`.
 *
 * @example
 * ```
 * const $ = ok({ my: "value" });
 *
 * $.ok // true
 * $.is("INVALID") // false
 * $.value // { my: "value" }
 * $.or({ my: "default" }) // { my: "value" }
 * $.orUndefined() // { my: "value" }
 * ```
 */

export function ok<VALUE>(value: VALUE): Ok<VALUE> {
  return Object.assign(Object.create(Ok) as Ok<VALUE>, { value });
}

// Err

export interface Err<
  ERROR = unknown,
  CONTEXT extends object | undefined = object | undefined
> extends Base<false> {
  error: ERROR;
  context: CONTEXT;
  cause: Err | Error | undefined;
  message: string | undefined;
  because<CAUSE extends Err<unknown> | Error>(
    cause: CAUSE
  ): Err<ERROR, CONTEXT>;
  /**
   * @internal
   * @deprecated
   */
  // ? Hack to strike "error" for intellisense.
  // TODO: Wish I could remove this without breaking .is(...) union inference.
  value?: never;
}

const Err: Err<unknown> = {
  ok: false,
  error: undefined,
  context: undefined,
  cause: undefined,
  message: undefined,
  because(cause) {
    this.cause = cause;
    return this;
  },
  is(error) {
    const argError = error;
    const thisError = (this as unknown as Err<typeof error>).error;
    if (typeof thisError === "string") return argError === thisError;
    // If this.error is not a string, it's probably an Error instance.
    // And Error.prototype would satisfy E extends E["error"], therefore we can
    //   compare that the given arg (.prototype) is the prototype of this.error.
    return argError === Object.getPrototypeOf(thisError);
  },
  or(value) {
    return value;
  },
  orUndefined() {
    return undefined;
  },
};

/**
 * Creates a new `Err` object with given error string and optional properties.
 * You will often use `err(...).because(...)` to create an error chain that is
 * useful for debugging, error-reporting, and/or control-flow.
 *
 * @param error An error string that may be used to discriminate error types.
 * @param options Any other `Err` properties to merge in.
 * @returns A new `Err` object using `error` and `options`.
 *
 * @example
 * ```
 * const $ = err("INVALID");
 * const $ = err("INVALID", {});
 * const $ = err("INVALID", { message: "Message.", context: { a: 1 } });
 * const $ = err("INVALID").because($previous);
 * const $ = err("INVALID", { cause: $previous });
 *
 * $.ok // false
 * $.is("INVALID") // true
 * $.error // "INVALID"
 * $.message // "Message."
 * $.context // { a: 1 }
 * $.or("defaultValue") // "defaultValue" (type-error, intended union with Ok)
 * $.orUndefined() // undefined
 * ```
 */

export function err<
  ERROR extends string,
  OPTIONS extends Partial<Err<ERROR>>,
  CONTEXT extends OPTIONS["context"] = undefined
>(error: ERROR, options?: OPTIONS): Err<ERROR, CONTEXT> {
  return Object.assign(
    Object.create(Err) as Err<ERROR, CONTEXT>,
    { error },
    options
  );
}

/**
 * Creates a new `Err` with any primitive value, e.g. `Error` objects. This is
 * also used internally by `fromThrowable` to return unknown thrown values.
 *
 * @param error Anything.
 * @returns A new `Err` object using `error` as is.
 *
 * @example
 * ```
 * const $ = err.primitive(new TypeError());
 *
 * $.ok // false
 * $.error // TypeError
 * $.is(TypeError.prototype) // true
 * $.is(SyntaxError.prototype) // false
 * ```
 */

err.primitive = function errPrimitive<ERROR>(error: ERROR): Err<ERROR> {
  return Object.assign(Object.create(Err) as Err<ERROR>, { error });
};

/**
 * Given VALUE and/or ERROR, creates a union of `Ok` and `Err` respectively.
 */

export type Result<VALUE = unknown, ERROR = unknown> = Ok<VALUE> | Err<ERROR>;

/**
 * Wraps a throwable function so that it cannot throw and instead returns:
 * - `Ok` with its normal return value, or
 * - `Err` with any thrown error value.
 *
 * @param fn Throwable function to be wrapped.
 *
 * @example
 * ```
 * const safeJSONParse = fromThrowable(JSON.parse);
 *
 * const $obj = safeJSONParse("sdkjhvi712364192387fsa");
 *
 * if (!$obj.ok) // $obj.error = SyntaxError: Unexpected token s in JSON ...
 * const obj = $obj.or({ my: { default: "structure" } }); // { my: { ... } }
 * const objFailed = $obj.orUndefined(); // undefined
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromThrowable<FN extends (...args: any[]) => any>(fn: FN) {
  function wrappedFn(
    ...args: Parameters<FN>
  ): Ok<ReturnType<FN>> | Err<unknown> {
    try {
      return ok(fn(...args));
    } catch (e) {
      return err.primitive(e);
    }
  }
  return wrappedFn;
}
