import Result from "./result";
import { expectNotType, expectType } from "tsd";

////////////////////////////////////////////////////////////////////////////////

describe("base", () => {
  test("type", () => {
    const $ = Result("abc") as Result<string, "MyError">;
    expect($).toMatchObject({ value: "abc" });

    if ($.error) {
      expectType<Result<never, "MyError">>($);
      expectType<Result.Error<"MyError">>($);
      return;
    }

    expectType<Result<string, never>>($);
    expectType<Result.Value<string>>($);

    {
      const [value] = $;
      expectType<string>(value);
    }
    {
      const value = $.value;
      expectType<string>(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expectType<Result.Any>([Result("abc"), Result.error(123)][0]!);
    expectType<Result.Async.Any>(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      new Promise(() => [Result("abc"), Result.error(123)][0]!)
    );

    expectType<Result.Value.Any>(Result("something"));
    expectType<Result.Value.Any>(Result(new Date()));
    expectType<Result.Error.Any>(Result.error("something"));
    expectType<Result.Error.Any>(Result.error(new Error()));

    expectType<Result.OrThrown>(Result.try(() => undefined));
    expectType<Result.OrThrown<string>>(Result.try(() => "abc"));
    expectType<Result.Async.OrThrown>(
      new Promise(() => Result.try(() => undefined))
    );
    expectType<Result.Async.OrThrown<string>>(
      new Promise(() => Result.try(() => "abc"))
    );

    {
      const fn = (): Result.Value.Any => {
        return Result(undefined);
      };

      const [value] = fn();
      expectType<unknown>(value);
    }
    {
      const fn = (): Result.Error.Any => {
        return Result.error("MyError");
      };

      const $ = fn();
      expectType<{ type: unknown; meta: unknown }>($.error);
      expectNotType<undefined>($.error.meta);
    }
    {
      const fn = ($: Result.Error.Any): unknown => {
        return $.error.type;
      };
      const $ = Result.error("MyError") as Result<
        string,
        "MyError" | ["MyMetaError", { foo: string }]
      >;
      // TODO: Solve why `$.error?.type === "MyError"` TS doesn't narrow Error.
      if ($.error?.type === "MyError") {
        // @ts-expect-error Solve TODO.
        fn($);
      }
      // Workaround, needs to discriminate on error property only, then by type.
      if ($.error && $.error.type === "MyError") {
        fn($);
      }
    }
    {
      interface Foo {
        a: number;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const fn = (): Result<Foo, "XA" | ["XB", { x: string }]> => {
        if (Math.random() === 1) return Result.error("XA");
        if (Math.random() === 1) return Result.error(["XB", { x: "foo" }]);
        return Result({ a: 1 });
      };
    }
  });
});

describe("value", () => {
  test("basic result", () => {
    const $ = Result(123);
    expect($).toMatchObject({ value: 123 });
    expectType<Result<number>>($);
    expectNotType<Result<string>>($);

    expect($.value).toBe(123);
    expectType<number>($.value);
    expectNotType<number | undefined>($.value);

    const [value] = $;
    expect(value).toBe(123);
    expectType<number>(value);
    expectNotType<number | undefined>(value);
    expectNotType<string>(value);

    expect($.or(456)).toBe(123);
    expect($.orUndefined()).toBe(123);

    // @ts-expect-error or(arg), arg must be same type as result value (number).
    expect($.or("abc")).toBe(123);

    const throws = jest.fn(() => $.orThrow());
    expect(throws).not.toThrow();
    expectType<() => number>($.orThrow);
  });

  test("async result", async () => {
    const $$ = (async () => Result("abc"))();
    expectType<Result.Async<string>>($$);
    expectNotType<Result.Async<number>>($$);

    const $ = await $$;
    expect($).toMatchObject({ value: "abc" });
    expectType<Result<string>>($);
    expectNotType<Result<number>>($);

    const [value] = $;
    expect(value).toBe("abc");
    expectType<string>(value);
    expectNotType<string | undefined>(value);
    expectNotType<number>(value);
  });
});

describe("error", () => {
  test("basic error", () => {
    const $ = Result.error("MyError");
    expect($).toMatchObject({
      error: { type: "MyError", meta: undefined, cause: undefined },
    });
    expectType<Result<never, "MyError">>($);
    expectNotType<Result<never, "OtherError">>($);

    expectType<"MyError">($.error.type);
    expectType<undefined>($.error.meta);
    expectType<unknown>($.error.cause);

    expect($.or("test" as never)).toBe("test");
    expect($.orUndefined()).toBeUndefined();

    const throws = jest.fn(() => $.orThrow());
    expect(throws).toThrow();
    expectType<() => never>($.orThrow);
  });

  test("error interop with jest without array prototype", () => {
    expect(
      Result.error([
        "MyError",
        { errors: [Result.error(["AX", { ax: "hello" }])] },
      ])
    ).toMatchObject({
      error: {
        type: "MyError",
        meta: { errors: [{ error: { type: "AX", meta: { ax: "hello" } } }] },
      },
    });
  });

  test("async error", async () => {
    const $$ = (async () => Result.error("MyError"))();
    expectType<Result.Async<never, "MyError">>($$);
    expectNotType<Result.Async<never, "OtherError">>($$);

    const $ = await $$;
    expect($).toMatchObject({ error: { type: "MyError" } });
    expectType<Result<never, "MyError">>($);
    expectNotType<Result<never, "OtherError">>($);
  });

  test("with meta", () => {
    const $ = Result.error(["MyError", { a: "1" }]);
    expect($).toMatchObject({ error: { type: "MyError", meta: { a: "1" } } });

    type MyError = ["MyError", { a: string }];
    type OtherError = ["OtherError", { b: number }];
    type MyErrorWithNumber = ["MyError", { a: number }];

    expectType<Result<never, MyError>>($);
    expectType<Result<never, MyError | OtherError>>($);
    expectNotType<Result<never, OtherError>>($);
    expectNotType<Result<never, MyErrorWithNumber>>($);

    expectType<{ a: string }>($.error.meta);
  });

  test("with cause", () => {
    const $result = Result.error("OtherError");
    const $ = Result.error("MyError", { cause: $result });
    expect($).toMatchObject({
      error: {
        type: "MyError",
        meta: {},
        cause: $result,
      },
    });
    expectType<Result<never, "MyError">>($);
    expectNotType<Result<never, ["MyError", { a: string }]>>($);

    expectType<undefined>($.error.meta);
  });

  test("with meta + cause", () => {
    const $result = Result.error("OtherError");
    const $ = Result.error(["MyError", { a: "foo" as const }], {
      cause: $result,
    });
    expect($).toMatchObject({
      error: {
        type: "MyError",
        meta: { a: "foo" },
        cause: $result,
      },
    });
    expectType<Result<never, ["MyError", { a: "foo" }]>>($);
    expectNotType<Result<never, ["MyError", { a: string }]>>($);
    expectNotType<Result<never, "MyError">>($);

    expectType<{ a: string }>($.error.meta);
  });

  test("via thrown", () => {
    const $ = Result.error.thrown(new TypeError("Foo is expected."));
    expectType<Result.Error.Thrown>($);

    expect($).toMatchObject({
      error: {
        type: {
          thrown: {
            message: "Foo is expected.",
          },
        },
      },
    });
    expect($.error.type.thrown).toBeInstanceOf(TypeError);
  });
});

describe("fn", () => {
  const fn = Result.fn(JSON.parse);

  test("value", () => {
    const $ = fn("{}");
    expect($).toMatchObject({ value: {}, error: undefined });

    if ($.error) return;
    const [value] = $;
    expectType<unknown>(value);
  });

  test("error", () => {
    const $ = fn("invalid");
    expect($.error?.type.thrown).toBeInstanceOf(SyntaxError);

    if ($.error) return;
    const [value] = $;
    expectType<unknown>(value);
  });

  const asyncFn = Result.fn(async (s: string) => JSON.parse(s));

  test("async value", async () => {
    const $$ = asyncFn("{}");
    expectType<Result.Async.OrThrown<unknown>>($$);

    const $ = await $$;
    expect($).toMatchObject({ value: {}, error: undefined });

    if ($.error) return;
    const [value] = $;
    expectType<unknown>(value);
  });

  test("async error", async () => {
    const $$ = asyncFn("invalid");
    expectType<Result.Async.OrThrown<unknown>>($$);

    const $ = await $$;
    expect($.error?.type.thrown).toBeInstanceOf(SyntaxError);

    if ($.error) return;
    const [value] = $;
    expectType<unknown>(value);
  });
});

describe("try", () => {
  test("sync", () => {
    const $ = Result.try(() => "value");
    expect($).toMatchObject({ value: "value", error: undefined });
    expectType<Result.OrThrown<string>>($);
  });

  test("async", async () => {
    const $$ = Result.try(async () => "value");
    expectType<Result.Async.OrThrown<string>>($$);

    const $ = await $$;
    expect($).toMatchObject({ value: "value", error: undefined });
    expectType<Result.OrThrown<string>>($);
  });
});

describe("returned", () => {
  test("with no errors", () => {
    function fn(): Result<string> {
      return Result("string");
    }

    const $ = fn();
    expectType<Result<string>>($);

    // * If no possible errors, then allow direct access!
    const [value] = $;
    expectType<string>(value);
  });

  test("with many errors", () => {
    function fn(
      input: string
    ): Result<
      string,
      "A" | "B" | ["AM", { am: string }] | ["BM", { bm: number }] | ["C"]
    > {
      if (input === "A") {
        return Result.error("A");
      }

      if (input === "B") {
        return Result.error("B");
      }

      if (input === "AM") {
        return Result.error(["AM", { am: "abc" }]);
      }

      if (input === "BM") {
        return Result.error(["BM", { bm: 123 }]);
      }

      return Result(input);
    }

    const $ = fn("1");
    if ($.error) {
      const value = $.or("2");
      expectType<string>(value);
      const valueOrUndefined = $.orUndefined();
      expectType<string | undefined>(valueOrUndefined);

      expectType<"A" | "B" | "AM" | "BM" | "C">($.error.type);
      if ($.error.type === "AM") {
        expectType<{ am: string }>($.error.meta);
      } else if ($.error.type === "BM") {
        expectType<{ bm: number }>($.error.meta);
      } else {
        expectType<undefined>($.error.meta);
      }

      return;
    }

    {
      const value = $.value;
      expectType<string>(value);
      expect($.value).toBe("1");
    }

    {
      const [value] = $;
      expectType<string>(value);
      expect($.value).toBe("1");
    }
  });
});
