import { expectType } from "tsd";
import { Result, Ok, ok, Err, err } from "./exports";

expectType<Result<string>>(Result.ok("" as string));
expectType<Result<number>>(Result.ok(10 as number));
expectType<Result<boolean>>(Result.ok(true as boolean));
expectType<Result<boolean>>(Result.ok(false as boolean));
expectType<Result<Ok<boolean>>>(Result.ok(true as boolean));
expectType<Result<Ok<boolean>>>(Result.ok(false as boolean));
expectType<Result<Result.Ok<boolean>>>(Result.ok(true as boolean));
expectType<Result<Result.Ok<boolean>>>(Result.ok(false as boolean));
expectType<Result<string, "FOO", { hello: string }>>(
  err("FOO").info({ hello: "world" })
);

expectType<Result<Result.Ok<boolean>>>(Result.err("SOMETHING"));
// @ts-expect-error SOMETHING does not match FOOBAR
expectType<Result<Result.Ok<boolean>, "FOOBAR">>(Result.err("SOMETHING"));

expectType<Result<Ok<string>, "FOO", { hello: string }>>(ok("helloworld"));
expectType<Result<boolean>["value"]>(true as boolean);
expectType<Result<boolean>["value"]>(false as boolean);
expectType<Result<boolean>["value"]>(ok(true as boolean).value as boolean);
expectType<Result<boolean>["value"]>(ok(false as boolean).value as boolean);

expectType<Result<Result.Ok<string>, "FOO", { hello: string }>>(
  Result.ok("helloworld")
);

// @ts-expect-error Ok<Number> does not match ok(string).
expectType<Result<Ok<number>, "FOO", { hello: string }>>(ok("helloworld"));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
>(err("FOO").info({ hello: "world" }));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
>(err("BAZ").info({ world: 100 }));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
  // @ts-expect-error "100" does not match of type number.
>(err("BAZ").info({ world: "100" }));

expectType<Result.Async<string>>((async () => Result.ok("foobar"))());

test(".ok .err .fromThrowable", () => {
  expect(Result.ok("foobar").ok).toBe(true);
  expect(Result.err("FOOBAR_ERROR").ok).toBe(false);
});
