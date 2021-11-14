import { Base } from "./base";

export class Ok<VALUE = unknown> extends Base<true, VALUE, never> {
  constructor(value: VALUE) {
    super(true, { value });
  }

  get value(): this["_value"] {
    return this._value;
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

export function ok<VALUE>(value: VALUE): Ok<VALUE> {
  return new Ok(value);
}
