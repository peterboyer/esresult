import { expectType } from "tsd";
import { Result } from "./result";
import { Ok, ok } from "./ok";
import { Err, err } from "./err";

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
