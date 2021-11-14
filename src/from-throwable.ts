import { ok } from "./ok";
import { err } from "./err";
import { Result } from "./result";

/**
 * Wraps a throwable function so that it cannot throw and instead returns:
 * - `Ok` with its normal return value, or
 * - `Err` with any thrown error value.
 *
 * @param fn Throwable function to be wrapped.
 *
 * @example
 * ```
 * const safeJSONParse = fromThrowable(JSON.parse);
 *
 * const $obj = safeJSONParse("sdkjhvi712364192387fsa");
 *
 * if (!$obj.ok) // $obj.error = SyntaxError: Unexpected token s in JSON ...
 * const obj = $obj.or({ my: { default: "structure" } }); // { my: { ... } }
 * const objFailed = $obj.orUndefined(); // undefined
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromThrowable<FN extends (...args: any[]) => any>(fn: FN) {
  function wrappedFn(...args: Parameters<FN>): Result<ReturnType<FN>, unknown> {
    try {
      return ok(fn(...args));
    } catch (e) {
      return err.primitive(e);
    }
  }
  return wrappedFn;
}
