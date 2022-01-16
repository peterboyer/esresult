import { ok } from "./ok";
import { err } from "./err";
import { Result } from "./result";

// https://stackoverflow.com/a/61626123
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, false>;

/**
 * Wraps a throwable function so that it cannot throw and instead returns:
 * - `Ok` with its normal return value, or
 * - `Err` with any thrown error value.
 *
 * @param fn Throwable function to be wrapped. Also supports async functions/
 * Promise-based return values.
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
  function wrappedFn(
    ...args: Parameters<FN>
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IsAny<ReturnType<FN>> extends true
    ? Result<ReturnType<FN>>
    : ReturnType<FN> extends void
    ? Result<void>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReturnType<FN> extends Promise<any>
    ? Promise<Result<Awaited<ReturnType<FN>>>>
    : Result<ReturnType<FN>> {
    try {
      const valueOrPromise = fn(...args);

      // if Promise/thenable
      if (!!valueOrPromise && typeof valueOrPromise.then === "function") {
        // @ts-expect-error TODO: Figure out how to gracefully handle this.
        return valueOrPromise
          .then((value: unknown) => ok(value))
          .catch((e: unknown) => err.primitive(e)) as Promise<
          Result<Awaited<ReturnType<FN>>>
        >;
      }

      // @ts-expect-error TODO: Figure out how to gracefully handle this.
      return ok(valueOrPromise);
    } catch (e) {
      // @ts-expect-error TODO: Figure out how to gracefully handle this.
      return err.primitive(e);
    }
  }
  return wrappedFn;
}
