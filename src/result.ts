import { Ok } from "./ok";
import { Err } from "./err";

/**
 * Given VALUE and/or ERROR, creates a union of `Ok` and `Err` respectively.
 * You may also pass in a INFO for common added properties for the `Err`.
 */

export type Result<
  VALUE = unknown,
  ERROR = unknown,
  INFO extends Record<string, unknown> = Record<string, unknown>
> = Ok<VALUE> | Err<ERROR, INFO>;
