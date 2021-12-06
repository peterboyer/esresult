import { expectType } from "tsd";
import { ok, err } from "./exports";

// err.ok must be false
expectType<false>(err("CODE").ok);
// err.error must match
expectType<"CODE">(err("CODE").error);
// union of err should union .error attributes
expectType<"AAA" | "BBB">([err("AAA").error, err("BBB").error][0]);
// err without given info should be undefined
expectType<undefined>(err("CCC").info);
expectType<undefined>(err("CCC").context);
// err with given info should be correctly assigned/generic
expectType<{ a: number }>(err("CCC", { info: { a: 1337 } }).info);
expectType<{ a: number }>(err("CCC", { context: { a: 1337 } }).context);
// err with later assigned info should be correctly assigned
expectType<{ a: number }>(err("CCC").$info({ a: 1337 }).info);
expectType<{ a: number }>(err("CCC").$context({ a: 1337 }).context);
// err with later assigned info + message should still be correctly assigned
expectType<{ a: number }>(
  err("CCC").$info({ a: 1337 }).$message("Something.").info
);
expectType<{ a: number }>(
  err("CCC").$info({ a: 1337 }).$message("Something.").context
);

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

test("with type + cause (with info)", () => {
  const $x = err("FAILED", { info: { foobar: 420 } });
  const $ = err("FOOBAR", { cause: $x });
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    cause: {
      error: "FAILED",
      info: { foobar: 420 },
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

test("with .$cause(...)", () => {
  const $x = err("FAILED");
  const $ = err("FOOBAR").$cause($x);
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    cause: {
      error: "FAILED",
    },
  });
});

test("with .$info(...)", () => {
  const $ = err("FOOBAR").$info({ foo: "bar", fin: "baz" });
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    info: {
      foo: "bar",
      fin: "baz",
    },
  });
});

test("with .$message(...)", () => {
  const $ = err("FOOBAR").$message("My error message.");
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    message: "My error message.",
  });
});

test("with stacked $info|$message|$cause", () => {
  const $x = err("FAILED");
  const $ = err("FOOBAR")
    .$info({ foo: "bar", fin: "baz" })
    .$message("Something went wrong...")
    .$cause($x);
  expect(!$.ok && $).toMatchObject({
    error: "FOOBAR",
    info: {
      foo: "bar",
      fin: "baz",
    },
    cause: {
      error: "FAILED",
    },
    message: "Something went wrong...",
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

describe("deprecations", () => {
  test("with type + context", () => {
    const $ = err("FOOBAR", { context: { foo: "bar", abc: 123 } });
    expect(!$.ok && $).toMatchObject({
      error: "FOOBAR",
      info: { foo: "bar", abc: 123 },
      context: { foo: "bar", abc: 123 },
    });
  });

  test("with .$context(...)", () => {
    const $ = err("FOOBAR").$context({ foo: "bar", abc: 123 });
    expect(!$.ok && $).toMatchObject({
      error: "FOOBAR",
      info: { foo: "bar", abc: 123 },
      context: { foo: "bar", abc: 123 },
    });
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
});
