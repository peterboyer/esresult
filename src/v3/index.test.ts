import Result from "v3";
import { expectType } from "tsd";

//

{
  // @ts-expect-error Result<number> not assignable to Result<string>.
  expectType<Result<string>>({} as Result<number>);
}

{
  // @ts-expect-error Result<number> not assignable to Result<string>.
  expectType<Result<string>>(Result({ value: 123 }));
}

() => {
  const fn = Result.fn(parseInt);
  const $ = fn("hello");

  if ($.error) {
    return Result({ error: "Fn", cause: $ });
  }

  const [value] = $;
  expectType<number>(value);
};

async () => {
  const fn = Result.fn(async (s: string) => JSON.parse(s));
  const $ = await fn("hello");

  if ($.error) {
    return Result({ error: "Fn", cause: $ });
  }

  const [value] = $;
  expectType<unknown>(value);
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

{
  // Result with a value -- should be able to tuple-destructure the value.
  const $ = Result(123);
  const [a, b] = $;
  expectType<number>(a);
  expectType<number | undefined>(b);
}

{
  // Result with an error -- must not be able to tuple-destructure.
  const $ = Result.error("Something");
  // @ts-expect-error Error type has no iterator, can't tuple-destructure.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [a, b] = $;
}

{
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
}

{
  const $ = Result.error("Something", { foo: 1, bar: 2 });
  expectType<"Something">($.error.type);
  expectType<{ foo: number; bar: number }>($.error.meta);
}
