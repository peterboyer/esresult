import { Base } from "./base";

/**
 * Alias for any compatible Ok without default constraints.
 */
export type OkAny = Ok<unknown, unknown>;

export class Ok<VALUE = unknown, WARNING = never> extends Base<
  true,
  VALUE,
  undefined
> {
  constructor(
    value: VALUE,
    options?: {
      warnings?: WARNING[];
    }
  ) {
    super(true, { value });
    this.#warnings = options?.warnings as WARNING[];
  }

  readonly #warnings?: WARNING[];

  toObject() {
    return {
      value: this.error,
      warnings: this.warnings(),
    };
  }

  warnings(): WARNING[] | undefined;
  warnings<T>(setErrors: T): Ok<VALUE, WARNING>;
  warnings<T>(setErrors?: T[]): WARNING[] | undefined | Ok<VALUE, T> {
    if (setErrors === undefined) {
      if (!this.#warnings?.length) return undefined;
      return this.#warnings;
    }
    return new Ok(this.value, {
      warnings: setErrors,
    });
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
 * $.error === "INVALID" // false
 * $.value // { my: "value" }
 * $.or({ my: "default" }) // { my: "value" }
 * $.orUndefined() // { my: "value" }
 * ```
 */

export function ok<VALUE, WARNING = never>(
  value: VALUE,
  options?: {
    warnings?: WARNING[];
  }
) {
  return new Ok<VALUE, WARNING>(value, options);
}
