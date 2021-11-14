import { Ok } from "./ok";
import { Err } from "./err";

/**
 * Given VALUE and/or ERROR, creates a union of `Ok` and `Err` respectively.
 */

export type Result<VALUE = unknown, ERROR = unknown> = Ok<VALUE> | Err<ERROR>;
