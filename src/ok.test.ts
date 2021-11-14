import { expectType } from "tsd";
import { ok } from "./exports";

expectType<true>(ok("value").ok);
expectType<string>(ok("value").value);

test("with simple value", () => {
  const $ = ok("foobar");
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe("foobar");
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
