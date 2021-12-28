import { expectType } from "tsd";
import { Ok, ok, err, Err } from "./exports";

// result types must match
expectType<Ok<number>>(ok(100));

expectType<true>(ok("value").ok);
expectType<string>(ok("value").value);
expectType<never[] | undefined>(ok("value").partialErrors);
expectType<Err<"FOOBAR">[] | undefined>(
  ok(
    "value",
    [].map(() => err("FOOBAR"))
  ).partialErrors
);
expectType<Err<"FOO" | "BAR">[] | undefined>(
  ok("value", [err("FOO"), err("BAR"), err("FOO")] as Err<"FOO" | "BAR">[])
    .partialErrors
);
expectType<Ok<number, Err<"FOOBAR">>>(ok(100, [err("FOOBAR")]));

// to be okay with partial errors with INFOs as interfaces
interface MyInterface {
  foo: string;
}
expectType<Err<string, MyInterface>[] | undefined>(
  ok("value", [err("MY_ERROR").$info({ foo: "bar" } as MyInterface)])
    .partialErrors
);

test("with simple value", () => {
  const $ = ok("foobar");
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe("foobar");
  expect($.ok && $.partialErrors).toBeUndefined();
});

test("with complex value", () => {
  const $ = ok({ foobar: ["hello", "world"] });
  expect($.ok && $.value).toMatchObject({ foobar: ["hello", "world"] });
});

test("with .is(...) error check", () => {
  const $ = ok({ foobar: ["hello", "world"] });
  // @ts-expect-error Ensures that .is() returns false on invalid type.
  expect($.is("ERROR")).toBe(false);
});

test("with .or(...) expect value", () => {
  const $ = ok("value");
  expect($.or("default")).toBe("value");
});

test("with .orUndefined() expect value", () => {
  const $ = ok("value");
  expect($.orUndefined()).toBe("value");
});

test("with partialErrors", () => {
  const errors = [err("ERR1"), err("ERR2"), err("ERR3")];
  const $ = ok("value", errors);
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe("value");
  expect($.ok && $.partialErrors?.length).toBe(3);
});

test("with partialErrors as empty array", () => {
  const errors: Err<"ERR">[] = [];
  const $ = ok("value", errors);
  expect($.ok && $.partialErrors).toBeUndefined();
});
