import { Base } from "./base";

/**
 * Alias for any compatible Ok without default constraints.
 */
export type OkAny = Ok<unknown, unknown>;

export class Ok<VALUE = unknown, PARTIAL_ERROR = never> extends Base<
  true,
  VALUE,
  never
> {
  #partialErrors?: PARTIAL_ERROR[];

  constructor(value: VALUE, partialErrors?: PARTIAL_ERROR[]) {
    super(true, { value });
    this.#partialErrors = partialErrors;
  }

  get value(): this["_value"] {
    return this._value;
  }

  get partialErrors(): PARTIAL_ERROR[] | undefined {
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

export function ok<VALUE, PARTIAL = never>(
  value: VALUE,
  partialErrors?: PARTIAL[]
) {
  return new Ok<VALUE, PARTIAL>(value, partialErrors);
}
