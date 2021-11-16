import { Base } from "./base";
import { Err } from "./err";

export class Ok<
  VALUE = unknown,
  PARTIALERRORS extends Err[] | undefined = undefined
> extends Base<true, VALUE, never> {
  #partialErrors?: PARTIALERRORS;

  constructor(value: VALUE, partialErrors?: PARTIALERRORS) {
    super(true, { value });
    this.#partialErrors = partialErrors;
  }

  get value(): this["_value"] {
    return this._value;
  }

  get partialErrors(): PARTIALERRORS | undefined {
    if (!this.#partialErrors?.length) return undefined;
    return this.#partialErrors;
  }
}

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

export function ok<VALUE, PARTIALERRORS extends Err[] | undefined = undefined>(
  value: VALUE,
  partialErrors?: PARTIALERRORS
): Ok<VALUE, PARTIALERRORS> {
  return new Ok(value, partialErrors);
}
