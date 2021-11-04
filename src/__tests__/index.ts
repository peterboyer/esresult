import { expectType } from "tsd";
import { ok, err, fromThrowable, Result, TError } from "../exports";

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
});

describe("err", () => {
  expectType<false>(err("CODE").ok);
  expectType<TError<"CODE">>(err("CODE").error);

  test("with type only", () => {
    const $ = err("FOOBAR");
    expect($.ok).toBe(false);
    expect(!$.ok && $.error).toMatchObject({ type: "FOOBAR" });
  });

  test("with type + message", () => {
    const $ = err("FOOBAR", { message: "Foo required Bar." });
    expect(!$.ok && $.error).toMatchObject({
      type: "FOOBAR",
      message: "Foo required Bar.",
    });
  });

  test("with type + cause (with context)", () => {
    const $x = err("FAILED", { context: { foobar: 420 } });
    const $ = err("FOOBAR", { cause: $x.error });
    expect(!$.ok && $.error).toMatchObject({
      type: "FOOBAR",
      cause: {
        type: "FAILED",
        context: { foobar: 420 },
      },
    });
  });
});

describe("err.unknown", () => {
  test("with primitive", () => {
    const $ = err.unknown("foobar");
    expect(!$.ok && $.error).toBe("foobar");
  });
  test("with error object", () => {
    const $ = err.unknown(new TypeError());
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

  test("with bad input", () => {
    const $ = safeParse(false);
    expect(!$.ok && $.error).toMatchObject(new TypeError("Bad source."));
  });

  test("with invalid input", () => {
    const $ = safeParse("@invalidinput");
    expect(!$.ok && $.error).toMatchObject(new TypeError("Invalid source."));
  });
});
