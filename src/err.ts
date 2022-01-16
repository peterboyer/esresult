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
  constructor(
    error: ERROR,
    options?: {
      info?: INFO;
      cause?: Cause;
      message?: Message;
    }
  ) {
    super(false, { error });
    this.#info = options?.info as INFO;
    this.#cause = options?.cause;
    this.#message = options?.message;
  }

  readonly #info: INFO;
  readonly #cause: Cause = undefined;
  readonly #message: Message = undefined;

  toObject() {
    return {
      error: this.error,
      info: this.info(),
      cause: this.cause(),
      message: this.message(),
    };
  }

  info(): INFO;
  info<T>(setInfo: T): Err<ERROR, T>;
  info<T>(setInfo?: T): INFO | Err<ERROR, T> {
    if (setInfo === undefined) return this.#info;
    return new Err(this.error, {
      info: setInfo,
      cause: this.#cause,
      message: this.#message,
    });
  }

  cause(): Cause;
  cause(setCause: Cause): Err<ERROR, INFO>;
  cause(setCause?: Cause): Cause | Err<ERROR, INFO> {
    if (setCause === undefined) return this.#cause;
    return new Err(this.error, {
      info: this.#info,
      cause: setCause,
      message: this.#message,
    });
  }

  message(): Message;
  message(setMessage: Message): Err<ERROR, INFO>;
  message(setMessage?: Message): Message | Err<ERROR, INFO> {
    if (setMessage === undefined) return this.#message;
    return new Err(this.error, {
      info: this.#info,
      cause: this.#cause,
      message: setMessage,
    });
  }
}

/**
 * Creates a new `Err` object with given error string and optional properties.
 * You will often use `err(...).cause(...)` to create an error chain that is
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
 * const $ = err("INVALID").cause($previous);
 * const $ = err("INVALID", { cause: $previous });
 * return err("INVALID")
 *   .cause($previous)
 *   .info({ a: 1 })
 *   .message("Something went wrong.");
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
export function err<ERROR extends string, INFO = undefined>(
  error: ERROR,
  options?: {
    info?: INFO;
    cause?: Cause;
    message?: Message;
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
 * $.error instanceof TypeError // true
 * $.error instanceof SyntaxError // false
 * ```
 */
err.primitive = function errPrimitive<ERROR>(error: ERROR): Err<ERROR> {
  return new Err(error);
};
