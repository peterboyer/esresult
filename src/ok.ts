import { Base } from "./base";
import { ErrAny, AsErr } from "./err";

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
      warnings?: AsErr<WARNING>[];
    }
  ) {
    super(true, { value });
    this.#warnings = options?.warnings as AsErr<WARNING>[];

    // @ts-expect-error Runtime debugging helper.
    this._warnings = options?.warnings;
  }

  readonly #warnings?: AsErr<WARNING>[];

  toObject() {
    return {
      ok: this.ok,
      value: this.error,
      warnings: this.warnings,
    };
  }

  get warnings(): AsErr<WARNING>[] | undefined {
    if (!this.#warnings?.length) return undefined;
    return this.#warnings;
  }

  $warnings<T extends ErrAny>(warnings: AsErr<T>[]): Ok<VALUE, T> {
    return new Ok(this.value, {
      warnings,
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
    warnings?: AsErr<WARNING>[];
  }
) {
  return new Ok<VALUE, WARNING>(value, options);
}

export type AsOk<OK_OR_VALUE> = [OK_OR_VALUE] extends [OkAny]
  ? OK_OR_VALUE
  : Ok<OK_OR_VALUE>;
