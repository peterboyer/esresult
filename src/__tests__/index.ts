import { expectType } from "tsd";
import { ok, err, fromThrowable, Result } from "../exports";

describe("ok", () => {
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
});

describe("err", () => {
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

  function fn(z: string) {
    if (z === "1") return err("AAA");
    if (z === "2") return err("BBB");
    if (z === "3") return err.primitive(new TypeError());
    return ok(z);
  }

  const $ = fn("1");
  // function result of union of Ok and Err should intellisense .is(...) to be
  //   only the union members from .error as argument.
  if ($.is("AAA")) fn("...");
  if ($.is("BBB")) fn("...");
  // @ts-expect-error "CCC" should not be assignable.
  if ($.is("CCC")) fn("...");

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

describe("fromThrowable", () => {
  function parse(source: unknown): string {
    if (typeof source !== "string") throw new TypeError("Bad source.");
    if (source.includes("@")) throw new TypeError("Invalid source.");
    return source;
  }

  const safeParse = fromThrowable(parse);
  expectType<Result<string>>(safeParse(true));

  const $ = safeParse("input");
  if ($.ok) expectType<string>($.value);
  if (!$.ok) expectType<unknown>($.error);

  test("with valid input", () => {
    const $ = safeParse("validinput");
    expect($.ok && $.value).toBe("validinput");
  });

  test("with invalid input throw 'bad'", () => {
    const $ = safeParse(false);
    expect(!$.ok && $.error).toMatchObject(new TypeError("Bad source."));
  });

  test("with invalid input throw 'invalid'", () => {
    const $ = safeParse("@invalidinput");
    expect(!$.ok && $.error).toMatchObject(new TypeError("Invalid source."));
  });
});
