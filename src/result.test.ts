import Result, { type Thrown } from "./result";

////////////////////////////////////////////////////////////////////////////////

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

    expectType<Result.ValueAny>(Result("something"));
    expectType<Result.ValueAny>(Result(new Date()));
    expectType<Result.ErrorAny>(Result.error("something"));
    expectType<Result.ErrorAny>(Result.error(new Error()));

    {
      const fn = (): Result.ValueAny => {
        return Result(undefined);
      };

      const [value] = fn();
      expectType<unknown>(value);
    }
    {
      const fn = (): Result.ErrorAny => {
        return Result.error("MyError");
      };

      const $ = fn();
      expectType<{ type: unknown; meta: unknown }>($.error);
      expectNotType<undefined>($.error.meta);
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
    expectType<Result.Async<unknown, Thrown>>($$);

    const $ = await $$;
    expect($).toMatchObject({ value: {}, error: undefined });

    if ($.error) return;
    const [value] = $;
    expectType<unknown>(value);
  });

  test("async error", async () => {
    const $$ = asyncFn("invalid");
    expectType<Result.Async<unknown, Thrown>>($$);

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
    expectType<Result<string, Thrown>>($);
  });

  test("async", async () => {
    const $$ = Result.try(async () => "value");
    expectType<Result.Async<string, Thrown>>($$);

    const $ = await $$;
    expect($).toMatchObject({ value: "value", error: undefined });
    expectType<Result<string, Thrown>>($);
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
