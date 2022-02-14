import { AsOk } from "./ok";
import { AsErr } from "./err";

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
 * Result<string, Err<"INVALID" | "MISMATCH">>
 * $.error => "INVALID" | "MISMATCH"
 *
 * Result<string, "INVALID", { input: string }>
 * $.error === "INVALID"  // $.info() => { input: string }
 *
 * Result<string, Err<"INVALID", { input: string }>>
 * $.error === "INVALID"  // $.info() => { input: string }
 *
 * Result<
 *   | Ok<string>,
 *   | Err<"INVALID", { input: string; issues: Issue[] }>
 *   | Err<"MISMATCH", { input: string; expected: string }>
 *   | Err<"FOO" | "BAR", { test: string }>
 * >
 * $.error === "INVALID"  // $.info() => { input, issues }
 * $.error === "MISMATCH" // $.info() => { input, expected }
 * $.error === "FOO"      // $.info() => { test }
 * $.error === "BAR"      // $.info() => { test }
 * ```
 */

export type Result<
  OK_OR_VALUE = unknown,
  ERR_OR_ERROR = unknown,
  INFO = unknown
> = AsOk<OK_OR_VALUE> | AsErr<ERR_OR_ERROR, INFO>;

export type ResultAsync<
  OK_OR_VALUE = unknown,
  ERR_OR_ERROR = unknown,
  INFO = unknown
> = Promise<Result<OK_OR_VALUE, ERR_OR_ERROR, INFO>>;

import * as _result from ".";
import * as _ok from "./ok";
import * as _err from "./err";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Async = _result.ResultAsync;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Ok = _ok.Ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import OkAny = _ok.OkAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ok = _ok.ok;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Err = _err.Err;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ErrAny = _err.ErrAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import err = _err.err;
}
