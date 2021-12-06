// Err

import { Base } from "./base";

export class Err<
  ERROR = unknown,
  CONTEXT extends Record<string, unknown> = Record<string, unknown>
> extends Base<false, undefined, ERROR> {
  constructor(
    error: ERROR,
    options?: {
      context?: CONTEXT;
      cause?: Err | Error;
      message?: string;
    }
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

  /**
   * Add/update the `Err`'s `context`.
   *
   * @param context A `Record` of attributes for this `Err`.
   * @returns A new `Err` with previous values + given `context`.
   */
  $context<CONTEXT extends Record<string, unknown>>(
    context: CONTEXT
  ): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      ...this,
      context,
    });
  }

  /**
   * Add/update the `Err`'s `cause`.
   *
   * @param cause An `Err` or `Error` object.
   * @returns A new `Err` with previous values + given `cause`.
   */
  $cause(cause: Err | Error | undefined): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      ...this,
      cause,
    });
  }

  /**
   * Add/update the `Err`'s `message`.
   *
   * @param message A `string` message.
   * @returns A new `Err` with previous values + given `message`.
   */
  $message(message: string): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      ...this,
      message,
    });
  }

  /**
   * Add/update the `Err`'s `source` (formerly `cause`).
   *
   * @deprecated Use `.$cause` instead.
   * @param cause An `Err` or `Error` object.
   * @returns A new `Err` with previous values + given `source`.
   */
  because(cause: Err | Error | undefined): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      ...this,
      cause,
    });
  }
}

/**
 * Creates a new `Err` object with given error string and optional properties.
 * You will often use `err(...).$cause(...)` to create an error chain that is
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
 * const $ = err("INVALID").$cause($previous);
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
