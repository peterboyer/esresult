// Err

import { Base } from "./base";

/**
 * Alias for any compatible Err without default constraints.
 */
export type ErrAny = Err<unknown, unknown>;

export class Err<ERROR = unknown, INFO = undefined> extends Base<
  false,
  undefined,
  ERROR
> {
  constructor(
    error: ERROR,
    options?: {
      info?: INFO;
      context?: INFO; // deprecated
      cause?: ErrAny | Error;
      message?: string;
    }
  ) {
    super(false, { error });
    this.info = (options?.info ?? options?.context) as INFO;
    this.cause = options?.cause;
    this.message = options?.message;
  }

  get error(): ERROR {
    return this._error;
  }

  readonly info: INFO;
  readonly cause: ErrAny | Error | undefined = undefined;
  readonly message: string | undefined = undefined;

  /**
   * @deprecated Use `.info` instead.
   */
  get context(): INFO {
    return this.info;
  }

  /**
   * Add/update the `Err`'s `info`.
   *
   * @param info A `Record` of attributes for this `Err`.
   * @returns A new `Err` with previous values + given `info`.
   */
  $info<INFO>(info: INFO): Err<ERROR, INFO> {
    return new Err(this._error, {
      ...this,
      info,
      context: info,
    });
  }

  /**
   * Add/update the `Err`'s `info` (formerly `context`).
   *
   * @deprecated
   * @param context A `Record` of attributes for this `Err`.
   * @returns A new `Err` with previous values + given `context`.
   */
  $context<CONTEXT>(context: CONTEXT): Err<ERROR, CONTEXT> {
    return new Err(this._error, {
      ...this,
      info: context,
      context,
    });
  }

  /**
   * Add/update the `Err`'s `cause`.
   *
   * @param cause An `Err` or `Error` object.
   * @returns A new `Err` with previous values + given `cause`.
   */
  $cause(cause: ErrAny | Error | undefined): Err<ERROR, INFO> {
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
  $message(message: string): Err<ERROR, INFO> {
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
  because(cause: ErrAny | Error | undefined): Err<ERROR, INFO> {
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
 * const $ = err("INVALID", { message: "Message.", info: { a: 1 } });
 * const $ = err("INVALID").$cause($previous);
 * const $ = err("INVALID", { cause: $previous });
 * return err("INVALID")
 *   .$cause($previous)
 *   .$info({ a: 1 })
 *   .$message("Something went wrong.");
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
export function err<ERROR extends string, INFO = undefined>(
  error: ERROR,
  options?: {
    info?: INFO;
    context?: INFO;
    cause?: ErrAny | Error;
    message?: string;
  }
) {
  return new Err<ERROR, INFO>(error, options);
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
