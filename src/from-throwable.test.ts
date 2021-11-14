import { expectType } from "tsd";
import { fromThrowable, Result } from "./exports";

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
