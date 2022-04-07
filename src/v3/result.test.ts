import Result from "./result";

////////////////////////////////////////////////////////////////////////////////

import { expectNotType, expectType } from "tsd";

////////////////////////////////////////////////////////////////////////////////

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
    expect($).toMatchObject({ error: { type: "MyError" } });
    expectType<Result<never, "MyError">>($);
    expectNotType<Result<never, "OtherError">>($);

    expectType<"MyError">($.error.type);
    expectType<Record<string, never>>($.error.meta);
    expectType<unknown>($.error.cause);

    expect($.or("test" as never)).toBe("test");
    expect($.orUndefined()).toBeUndefined();
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
    const $ = Result.error("MyError", { $cause: $result });
    expect($).toMatchObject({
      error: {
        type: "MyError",
        meta: {},
        cause: $result,
      },
    });
    expectType<Result<never, "MyError">>($);
    expectNotType<Result<never, ["MyError", { a: string }]>>($);

    // TODO: remove $cause from meta object generic arg
    expectType<Record<string, never>>($.error.meta);
  });

  test("with meta + cause", () => {
    const $result = Result.error("OtherError");
    const $ = Result.error(["MyError", { a: "foo" as const }], {
      $cause: $result,
    });
    expect($).toMatchObject({
      error: {
        type: "MyError",
        meta: { a: "1" },
        cause: $result,
      },
    });
    expectType<Result<never, ["MyError", { a: "foo" }]>>($);
    expectNotType<Result<never, ["MyError", { a: string }]>>($);
    expectNotType<Result<never, "MyError">>($);

    expectType<{ a: string }>($.error.meta);
  });
});

// describe("function", () => {});

// () => {
//   const fn = Result.fn(parseInt);
//   const $ = fn("hello");

//   if ($.error) {
//     return Result({ error: "Fn", cause: $ });
//   }

//   const [value] = $;
//   expectType<number>(value);
//   return;
// };

async () => {
  const fn = Result.fn(async (s: string) => JSON.parse(s));
  const $ = await fn("hello");

  if ($.error) {
    return Result({ error: "Fn", cause: $ });
  }

  const [value] = $;
  expectType<unknown>(value);
  return;
};

async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const $ = await Result.try(async () => {});

  if ($.error) {
    const { thrown } = $.error.type;
    expectType<unknown>(thrown);
    expectType<{ thrown: unknown }>($.error.type);

    return Result({ error: "Fn", cause: $ });
  }

  const [value] = $;
  expectType<void>(value);
  return;
};

function foo(input: string): Result<number, "Invalid" | "Unknown"> {
  if (!input) {
    // @ts-expect-error Incompatible Result .value type.
    return Result({ value: "incompatible" });
  }

  if (input === "unknown") {
    // @ts-expect-error Incompatible Result .error type.
    return Result({ error: "foobar" });
  }

  const output = parseInt(input);

  if (Number.isNaN(output)) {
    return Result.error("Invalid");
  }

  return Result(output);
}

() => {
  const $ = foo("foobar");

  expectType<"Invalid" | "Unknown" | undefined>($.error?.type);
  // @ts-expect-error .error.meta should not be accessible yet.
  expectType($.error.neta);

  const valueOrDefault = $.or(123);
  expectType<number>(valueOrDefault);

  const valueOrUndefined = $.orUndefined();
  expectType<number | undefined>(valueOrUndefined);

  if ($.error) {
    return $.error;
  }

  const [value] = $;
  expectType<number>(value);
  return;
};

function bar(
  input: string
): Result<
  number,
  | ["Invalid", { count: number }]
  | ["Disconnect", { code: "aaa" | "bbb" }]
  | "Unknown"
> {
  if (!input) {
    return Result.error("Unknown");
  }

  if (input === "unknown") {
    return Result.error("Invalid", { count: 123, code: "asdf" });
  }

  const output = parseInt(input);

  if (Number.isNaN(output)) {
    return Result.error("Disconnect", { code: "aaa" } as const);
  }

  return Result(output);
}

test("destructure iterable value from result", () => {
  // Result with a value -- should be able to tuple-destructure the value.
  const $ = Result(123);
  const [a, b] = $;
  expectType<number>(a);
  expectType<number | undefined>(b);
});

test("fail to destructure iterable value from result.error", () => {
  // Result with an error -- must not be able to tuple-destructure.
  const $ = Result.error("Something");
  // @ts-expect-error Error type has no iterator, can't tuple-destructure.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [a, b] = $;
});

test("direct destructuring of variable", () => {
  // Result from function -- no error defined, should allow tuple-destructure.
  const fn = (): Result<number> => {
    return Result(123);
  };

  // destructure afterwards, from result variable
  const $ = fn();
  const [a] = $;
  expectType<number>(a);

  // destructure directly, from result of function
  const [b] = fn();
  expectType<number>(b);
});
