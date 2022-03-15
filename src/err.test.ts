import { expectType } from "tsd";
import { ok, Err, ErrAny, err, Result } from "./exports";

// result types must match
expectType<Err<"CODE">>(err("CODE"));

// err.ok must be false
expectType<false>(err("CODE").ok);
// err.error must match
expectType<"CODE">(err("CODE").error);
// union of err should union .error attributes
expectType<"AAA" | "BBB">([err("AAA").error, err("BBB").error][0]);
// err without given info should be undefined
expectType<undefined>(err("CCC").info);
// err with later assigned info should be correctly assigned
expectType<{ a: number }>(err("CCC").$info({ a: 1337 }).info);
// err with later assigned info + message should still be correctly assigned
expectType<{ a: number }>(
  err("CCC").$info({ a: 1337 }).$message("Something.").info
);
// err cause with unknown error
{
  const $: Result<unknown> = err("SOMETHING");
  !$.ok ? err("CCC").$cause($) : undefined;
}
// err with info as interface instead of a plain object/record should be ok
interface MyInterface {
  foo: string;
}
expectType<MyInterface>(
  err("CCC")
    .$info({} as MyInterface)
    .$message("Something.").info
);
// union of Err with and without info definitions, adding A without info
{
  type MyError =
    | Err<"A">
    | Err<"B", { bProp: string }>
    | Err<"C", { cProp: number }>;

  const errors = new Set<MyError>();
  errors.add(err("A"));
  errors.add(err("A").$info(undefined));
  errors.add(err("B").$info({ bProp: "abc" }));
  errors.add(err("C").$info({ cProp: 123 }));
}

test("with type only", () => {
  const $ = err("FOOBAR");
  expect($.ok).toBe(false);
  expect($.toObject()).toMatchObject({ error: "FOOBAR" });
});

test("with type + message", () => {
  const $ = err("FOOBAR").$message("Foo required Bar.");
  expect($.toObject()).toMatchObject({
    error: "FOOBAR",
    message: "Foo required Bar.",
  });
});

test("with type + cause (with info)", () => {
  const $x = err("FAILED").$info({ foobar: 420 });
  const $ = err("FOOBAR").$cause($x);
  const _$ = $.toObject();
  expect(_$).toMatchObject({
    error: "FOOBAR",
  });
  expect((_$.cause as ErrAny).toObject()).toMatchObject({
    error: "FAILED",
    info: { foobar: 420 },
  });
});

test("with .error error check", () => {
  const $ = err("FOOBAR");
  expect($.error === "FOOBAR").toBe(true);
  // @ts-expect-error ERROR is not assignable, checking return of false.
  expect($.error === "ERROR").toBe(false);
});

test("with .error check with instanceof", () => {
  const $ = err.primitive(new TypeError());
  expect($.error instanceof TypeError).toBe(true);
  expect($.error instanceof SyntaxError).toBe(false);
});

test("with .setCause(...)", () => {
  const $x = err("FAILED");
  const $ = err("FOOBAR").$cause($x);
  expect($.toObject()).toMatchObject({
    error: "FOOBAR",
    cause: {
      error: "FAILED",
    },
  });
});

test("with .setInfo(...)", () => {
  const $ = err("FOOBAR").$info({ foo: "bar", fin: "baz" });
  expect($.toObject()).toMatchObject({
    error: "FOOBAR",
    info: {
      foo: "bar",
      fin: "baz",
    },
  });
});

test("with .setMessage(...)", () => {
  const $ = err("FOOBAR").$message("My error message.");
  expect($.toObject()).toMatchObject({
    error: "FOOBAR",
    message: "My error message.",
  });
});

test("with stacked info|message|cause", () => {
  const $x = err("FAILED");
  const $ = err("FOOBAR")
    .$info({ foo: "bar", fin: "baz" })
    .$message("Something went wrong...")
    .$cause($x);
  expect($.toObject()).toMatchObject({
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

test("with .causeMap on causeless", () => {
  const $ = err("FOO");
  expect($.causeMap()).toMatchObject([err("FOO")]);
  expect($.causeMap()).not.toMatchObject([err("BAR")]);
});

test("with .causeMap expect chain of error strings", () => {
  const $ = err("A").$cause(
    err("B").$cause(err("C").$cause(new TypeError("Divide by zero.")))
  );
  expect($.causeMap(Err.causeMapFnString)).toMatchObject([
    "A",
    "B",
    "C",
    'TypeError("Divide by zero.")',
  ]);
});

test("with .causeMap with custom callback", () => {
  const $ = err("A").$cause(
    err("B").$cause(err("C").$cause(new TypeError("Divide by zero.")))
  );
  expect(
    $.causeMap(
      (cause) =>
        (cause instanceof Err
          ? `${cause.error}`
          : `${cause.name}("${cause.message}")`
        ).length
    )
  ).toMatchObject([1, 1, 1, 28]);
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
  if ($.error === "AAA") fn("...");
  if ($.error === "BBB") fn("...");
  // @ts-expect-error "CCC" should not be assignable.
  if ($.error === "CCC") fn("...");

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
