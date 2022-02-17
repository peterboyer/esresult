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
  constructor(value: VALUE) {
    super(true, { value });
  }

  private _warnings: AsErr<WARNING>[] | undefined = undefined;

  toObject() {
    return {
      ok: this.ok,
      value: this.error,
      warnings: this.warnings,
    };
  }

  get warnings(): AsErr<WARNING>[] | undefined {
    if (!this._warnings?.length) return undefined;
    return this._warnings;
  }

  $warnings<T extends ErrAny>(warnings: AsErr<T>[]): Ok<VALUE, T> {
    return Object.assign(new Ok(this.value), {
      _warnings: warnings,
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

export function ok<VALUE>(value: VALUE) {
  return new Ok<VALUE, never>(value);
}

export type AsOk<OK_OR_VALUE> = [OK_OR_VALUE] extends [OkAny]
  ? OK_OR_VALUE
  : Ok<OK_OR_VALUE>;
