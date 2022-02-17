import { Base } from "./base";

export type Cause = ErrAny | Error | undefined;
export type Message = string | undefined;

/**
 * Alias for any compatible Err without default constraints.
 */
export type ErrAny = Err<unknown, unknown>;

export class Err<ERROR = unknown, INFO = undefined> extends Base<
  false,
  undefined,
  ERROR
> {
  constructor(error: ERROR) {
    super(false, { error });
  }

  private _info: INFO = undefined as unknown as INFO;
  private _cause: Cause = undefined;
  private _message: Message = undefined;

  toObject() {
    return {
      ok: this.ok,
      error: this.error,
      info: this.info,
      cause: this.cause,
      message: this.message,
    };
  }

  get info(): INFO {
    return this._info;
  }

  $info<T>(info?: T): Err<ERROR, T> {
    return Object.assign(new Err<ERROR, T>(this.error), {
      _info: info,
      _cause: this._cause,
      _message: this._message,
    });
  }

  get cause(): Cause {
    return this._cause;
  }

  $cause(cause?: Cause): Err<ERROR, INFO> {
    return Object.assign(new Err<ERROR, INFO>(this.error), {
      _info: this._info,
      _cause: cause,
      _message: this._message,
    });
  }

  get message(): Message {
    return this._message;
  }

  $message(message: Message): Err<ERROR, INFO> {
    return Object.assign(new Err<ERROR, INFO>(this.error), {
      _info: this._info,
      _cause: this._cause,
      _message: message,
    });
  }
}

/**
 * Creates a new `Err` object with given error string and optional properties.
 * You will often use `err(...).setCause(...)` to create an error chain that is
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
 * const $ = err("INVALID").setCause($previous);
 * const $ = err("INVALID", { cause: $previous });
 * return err("INVALID")
 *   .setCause($previous)
 *   .setInfo({ a: 1 })
 *   .setMessage("Something went wrong.");
 *
 * $.ok // false
 * $.error // "INVALID"
 * $.error === "INVALID" // true
 * $.message // "Message."
 * $.context // { a: 1 }
 * $.or("defaultValue") // "defaultValue" (type-error, intended union with Ok)
 * $.orUndefined() // undefined
 * ```
 */
export function err<ERROR extends string>(error: ERROR) {
  return new Err<ERROR, undefined>(error);
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
 * $.error instanceof TypeError // true
 * $.error instanceof SyntaxError // false
 * ```
 */
err.primitive = function errPrimitive<ERROR>(error: ERROR): Err<ERROR> {
  return new Err(error);
};

export type AsErr<ERR_OR_ERROR, INFO = unknown> = [ERR_OR_ERROR] extends [
  ErrAny
]
  ? ERR_OR_ERROR
  : Err<ERR_OR_ERROR, INFO>;
