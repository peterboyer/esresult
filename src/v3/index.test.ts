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
  const $ = await Result.from(async () => {});

  if ($.error) {
    return Result({ error: "Fn", cause: $ });
  }

  const [value] = $;
  expectType<void>(value);
};

function parse(input: string): Result<number, "Invalid" | "Unknown"> {
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
    return Result({ error: "Invalid" });
  }

  return Result({ value: output });
}

() => {
  const $ = parse("foobar");

  expectType<"Invalid" | "Unknown" | undefined>($.error);
  // @ts-expect-error .meta should not be accessible yet.
  expectType($.meta);
  // @ts-expect-error .message should not be accessible yet.
  expectType($.message);

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
