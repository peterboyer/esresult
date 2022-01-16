import { expectType } from "tsd";
import { Result, Ok, ok, Err, err } from "./exports";

expectType<Result<string, "FOO", { hello: string }>>(
  err("FOO").$info({ hello: "world" })
);

expectType<Result<Ok<string>, "FOO", { hello: string }>>(ok("helloworld"));

// @ts-expect-error Ok<Number> does not match ok(string).
expectType<Result<Ok<number>, "FOO", { hello: string }>>(ok("helloworld"));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
>(err("FOO").$info({ hello: "world" }));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
>(err("BAZ").$info({ world: 100 }));

expectType<
  Result<
    string,
    Err<"FOO", { hello: string }> | Err<"BAR" | "BAZ", { world: number }>
  >
  // @ts-expect-error "100" does not match of type number.
>(err("BAZ").$info({ world: "100" }));

expectType<Result.Async<string>>((async () => Result.ok("foobar"))());

test(".ok .err .fromThrowable", () => {
  expect(Result.ok("foobar").ok).toBe(true);
  expect(Result.err("FOOBAR_ERROR").ok).toBe(false);
  expect(
    Result.fromThrowable(() => {
      throw new Error();
    })()._error
  ).toBeInstanceOf(Error);
});
