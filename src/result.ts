import { Ok, OkAny } from "./ok";
import { Err, ErrAny } from "./err";

/**
 * Given OK and/or ERR, creates a union of `Ok` and `Err` respectively. You may
 * also pass in a INFO for common `info` for the `Err`.
 *
 * - If OK is given as Ok, is used as is, otherwise as VALUE to Ok<...>
 * - If ERR is given as Err, is used as is, otherwise as ERROR to Err<...>
 * - If INFO is given, is used as INFO to Err<...>. Ignored if ERR extends Err.
 *
 * @example
 * ```ts
 * Result<string>
 * $.value => string
 *
 * Result<Ok<string>>
 * $.value => string
 *
 * Result<string, "INVALID">
 * $.error => "INVALID"
 *
 * Result<string, "INVALID" | "MISMATCH">
 * $.error => "INVALID" | "MISMATCH"
 *
 * Result<string, "INVALID", { input: string }>
 * $.info => { input: string }
 *
 * Result<
 *   Ok<string>,
 *   | Err<"INVALID", { input: string; validationErrors: Issue[] }>
 *   | Err<"MISMATCH", { input: string; expected: string }>
 *   | Err<"FOO" | "BAR", { test: string }>
 * >
 * $.is("INVALID") // $.info => { input, validationErrors }
 * $.is("MISMATCH") // $.info => { input, expected }
 * $.is("FOO") // $.info => { test }
 * $.is("BAR") // $.info => { test }
 * ```
 */

export type Result<
  OK_OR_VALUE = unknown,
  ERR_OR_ERROR = unknown,
  INFO = unknown
> =
  | (OK_OR_VALUE extends OkAny ? OK_OR_VALUE : Ok<OK_OR_VALUE>)
  | (ERR_OR_ERROR extends ErrAny ? ERR_OR_ERROR : Err<ERR_OR_ERROR, INFO>);
