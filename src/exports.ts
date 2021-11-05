// Monad

export interface Monad<OK extends true | false> {
  ok: OK;
  is<ERR, E extends "error" extends keyof ERR ? ERR["error"] : never>(
    this: ERR,
    error: E
  ): boolean;
}

// Ok

export interface Ok<VALUE> extends Monad<true> {
  value: VALUE;
  // TODO: Wish I could remove this without breaking .is(...) inference.
  /** @deprecated @internal */ // ? Hack to strike "error" for intellisense.
  error?: never;
}

const Ok: Ok<undefined> = {
  ok: true,
  value: undefined,
  is() {
    return false;
  },
};

export function ok<VALUE>(value: VALUE): Ok<VALUE> {
  return Object.assign(Object.create(Ok) as Ok<VALUE>, { value });
}

// Err

export interface Err<
  ERROR = string,
  CONTEXT extends object | undefined = object | undefined
> extends Monad<false> {
  error: ERROR;
  context: CONTEXT;
  cause: Err | Error | undefined;
  message?: string;
  because(cause: Err | Error): Err<ERROR, CONTEXT>;
}

const Err: Err<undefined> = {
  ok: false,
  error: undefined,
  context: undefined,
  cause: undefined,
  is(error) {
    const argError = error;
    const thisError = (this as unknown as Err<typeof error>).error;
    if (typeof thisError === "string") return argError === thisError;
    // If this.error is not a string, it's probably an Error instance.
    // And Error.prototype would satisfy E extends E["error"], therefore we can
    //   compare that the given arg (.prototype) is the prototype of this.error.
    return argError === Object.getPrototypeOf(thisError);
  },
  because(cause) {
    this.cause = cause;
    return this;
  },
};

export function err<
  ERROR extends string,
  OPTIONS extends Partial<Err<ERROR>>,
  CONTEXT extends OPTIONS["context"] = undefined
>(error: ERROR, options?: OPTIONS): Err<ERROR, CONTEXT> {
  return Object.assign(
    Object.create(Err) as Err<ERROR, CONTEXT>,
    { error },
    options
  );
}

err.primitive = function errPrimitive<ERROR>(error: ERROR): Err<ERROR> {
  return Object.assign(Object.create(Err) as Err<ERROR>, { error });
};

export type Result<VALUE = unknown, ERROR = unknown> = Ok<VALUE> | Err<ERROR>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromThrowable<FN extends (...args: any[]) => any>(
  fn: FN
): (...args: Parameters<FN>) => Ok<ReturnType<FN>> | Err<unknown> {
  function wrappedFn(...args: Parameters<FN>) {
    try {
      return ok(fn(...args));
    } catch (e) {
      return err.primitive(e);
    }
  }
  wrappedFn.name = `fromThrowable(${fn.name})`;
  return wrappedFn;
}
