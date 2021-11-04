export interface Ok<VALUE> {
  ok: true;
  value: VALUE;
}

export function ok<VALUE>(value: VALUE): Ok<VALUE> {
  return { ok: true, value };
}

export interface Err<ERROR> {
  ok: false;
  error: ERROR;
}

export type TError<TYPE = string> = {
  type: TYPE;
  message?: string;
  cause?: Error | TError;
  context?: Record<string, unknown>;
};

export function err<TYPE extends string, OPTIONS extends Omit<TError, "type">>(
  type: TYPE,
  options?: OPTIONS
): Err<TError<TYPE>> {
  return { ok: false, error: { type, ...options } };
}

err.unknown = function errUnknown<ERROR>(error: ERROR): Err<ERROR> {
  return { ok: false, error };
};

export type Result<VALUE = unknown, ERROR = unknown> = Ok<VALUE> | Err<ERROR>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromThrowable<FN extends (...args: any[]) => any>(
  fn: FN
): (...args: Parameters<FN>) => Result<ReturnType<FN>, unknown> {
  function wrappedFn(...args: Parameters<FN>) {
    try {
      return ok(fn(...args));
    } catch (e) {
      return err.unknown(e);
    }
  }
  wrappedFn.name = `fromThrowable(${fn.name})`;
  return wrappedFn;
}
