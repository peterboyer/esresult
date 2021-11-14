// Err

import { Base } from "./base";

export class Err<
  ERROR = unknown,
  CONTEXT extends Record<string, unknown> = Record<string, unknown>
> extends Base<false, undefined, ERROR> {
  constructor(
    error: ERROR,
    options?: { context?: CONTEXT; cause?: Err | Error; message?: string }
  ) {
    super(false, { error });
    this.context = options?.context as CONTEXT;
    this.cause = options?.cause;
    this.message = options?.message;
  }

  get error(): ERROR {
    return this._error;
  }

  readonly context: CONTEXT;
  readonly cause: Err | Error | undefined = undefined;
  readonly message: string | undefined = undefined;

  because(cause: Err | Error | undefined): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      cause,
      context: this.context,
      message: this.message,
    });
  }
}

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
  CONTEXT extends Record<string, unknown> = never
>(
  error: ERROR,
  options?: { context?: CONTEXT; cause?: Err | Error; message?: string }
) {
  return new Err(error, options);
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
  return new Err(error);
};
