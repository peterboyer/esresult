import { expectType } from "tsd";
import { ok, err } from "./exports";

// err.ok must be false
expectType<false>(err("CODE").ok);
// err.error must match
expectType<"CODE">(err("CODE").error);
// union of err should union .error attributes
expectType<"AAA" | "BBB">([err("AAA").error, err("BBB").error][0]);
// err without given context should be undefined
expectType<undefined>(err("CCC").context);
// err with given context should be correctly assigned/generic
expectType<{ a: number }>(err("CCC", { context: { a: 1337 } }).context);

test("with type only", () => {
  const $ = err("FOOBAR");
  expect($.ok).toBe(false);
  expect(!$.ok && $).toMatchObject({ error: "FOOBAR" });
});

test("with type + message", () => {
  const $ = err("FOOBAR", { message: "Foo required Bar." });
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    message: "Foo required Bar.",
  });
});

test("with type + cause (with context)", () => {
  const $x = err("FAILED", { context: { foobar: 420 } });
  const $ = err("FOOBAR", { cause: $x });
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    cause: {
      error: "FAILED",
      context: { foobar: 420 },
    },
  });
});

test("with .is(...) error check", () => {
  const $ = err("FOOBAR");
  expect($.is("FOOBAR")).toBe(true);
  // @ts-expect-error ERROR is not assignable, checking return of false.
  expect($.is("ERROR")).toBe(false);
});

test("with .is(...) error check with Error type", () => {
  const $ = err.primitive(new TypeError());
  expect($.is(TypeError.prototype)).toBe(true);
  expect($.is(SyntaxError.prototype)).toBe(false);
});

test("with .because(...)", () => {
  const $x = err("FAILED");
  const $ = err("FOOBAR").because($x);
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    cause: {
      error: "FAILED",
    },
  });
});

test("with .or(...) expect default (and type error)", () => {
  const $ = err("FOOBAR");
  // @ts-expect-error defaultValue can't be anything but undefined.
  expect($.or("string")).toBe("string");
  expect($.or(undefined)).toBeUndefined();
});

test("with .orUndefined() expect undefined", () => {
  const $ = err("FOOBAR");
  expect($.orUndefined()).toBeUndefined();
});

describe("ok|err union", () => {
  function fn(z: string) {
    if (z === "1") return err("AAA");
    if (z === "2") return err("BBB");
    if (z === "3") return err.primitive(new TypeError());
    if (z === "4") return ok(false);
    return ok(z);
  }

  const $ = fn("1");
  // function result of union of Ok and Err should intellisense .is(...) to be
  //   only the union members from .error as argument.
  if ($.is("AAA")) fn("...");
  if ($.is("BBB")) fn("...");
  // @ts-expect-error "CCC" should not be assignable.
  if ($.is("CCC")) fn("...");

  // can be string because ok(z -> string)
  $.or("string");
  // can be boolean because ok(false -> boolean)
  $.or(true);
  // cannot be number because no ok values given
  // @ts-expect-error 123 should not be assignable.
  $.or(123);

  test("with .or(...) expect default", () => {
    const $ = fn("1");
    expect($.or("string")).toBe("string");
  });

  test("with .or(...) expect value", () => {
    const $ = fn("value");
    expect($.or("string")).toBe("value");
  });

  test("with .orUndefined() expect undefined", () => {
    const $ = fn("1");
    expect($.orUndefined()).toBeUndefined();
  });

  test("with .orUndefined() expect value", () => {
    const $ = fn("value");
    expect($.orUndefined()).toBe("value");
  });
});

describe("err.primitive", () => {
  expectType<string>(err.primitive("foobar").error);
  expectType<TypeError>(err.primitive(new TypeError()).error);

  test("with string", () => {
    const $ = err.primitive("foobar");
    expect(!$.ok && $.error).toBe("foobar");
  });
  test("with error", () => {
    const $ = err.primitive(new TypeError());
    expect(!$.ok && $.error).toMatchObject(new TypeError());
  });
});
