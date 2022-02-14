import { expectType } from "tsd";
import { Ok, ok, err, Err } from "./exports";

// result types must match
expectType<Ok<number>>(ok(100));
expectType<Ok<boolean>>(ok(true));
expectType<Ok<boolean>>(ok(true as boolean));
expectType<Ok<boolean>>(ok(false as boolean));

expectType<true>(ok("value").ok);
expectType<string>(ok("value").value);
expectType<never[] | undefined>(ok("value").warnings());
expectType<Err<"FOOBAR">[] | undefined>(
  ok("value", { warnings: [].map(() => err("FOOBAR")) }).warnings()
);
expectType<Err<"FOOBAR">[] | undefined>(
  ok("value")
    .warnings([].map(() => err("FOOBAR")))
    .warnings()
);
expectType<Err<"FOO" | "BAR">[] | undefined>(
  ok("value")
    .warnings([err("FOO"), err("BAR"), err("FOO")] as Err<"FOO" | "BAR">[])
    .warnings()
);

// TODO: Uncommented: Is this an issue?
// expectType<Ok<boolean, "FOO">>(ok(true).warnings([err("FOO")]));

expectType<Ok<boolean, Err<"FOO">>>(ok(true).warnings([err("FOO")]));

// @ts-expect-error Reject a non-array value.
expectType<Ok<boolean, "FOO">>(ok(true).warnings("FOO"));
// @ts-expect-error Reject a non-array value.
expectType<Ok<boolean, "FOO">>(ok(true).warnings(err("FOO")));

// @ts-expect-error BAR not assignable to FOO.
expectType<Ok<boolean, "FOO">>(ok(true).warnings([err("BAR")]));
// @ts-expect-error BAR not assignable to FOO.
expectType<Ok<boolean, Err<"FOO">>>(ok(true).warnings([err("BAR")]));

// to be okay with partial errors with INFOs as interfaces
interface MyInterface {
  foo: string;
}
expectType<Err<string, MyInterface>[] | undefined>(
  ok("value")
    .warnings([err("MY_ERROR").info({ foo: "bar" } as MyInterface)])
    .warnings()
);

test("with simple value", () => {
  const $ = ok("foobar");
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe("foobar");
  expect($.ok && $.warnings()).toBeUndefined();
});

test("with complex value", () => {
  const $ = ok({ foobar: ["hello", "world"] });
  expect($.ok && $.value).toMatchObject({ foobar: ["hello", "world"] });
});

test("with .error check", () => {
  const $ = ok({ foobar: ["hello", "world"] });
  expect($.error === "ERROR").toBe(false);
});

test("with .or(...) expect value", () => {
  const $ = ok("value");
  expect($.or("default")).toBe("value");
});

test("with .orUndefined() expect value", () => {
  const $ = ok("value");
  expect($.orUndefined()).toBe("value");
});

test("with warnings", () => {
  const warnings = [err("ERR1"), err("ERR2"), err("ERR3")];
  const $ = ok("value").warnings(warnings);
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe("value");
  expect($.ok && $.warnings()?.length).toBe(3);
});

test("with warnings as empty array", () => {
  const warnings: Err<"ERR">[] = [];
  const $ = ok("value", { warnings });
  expect($.ok && $.warnings()).toBeUndefined();
});
