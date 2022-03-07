import { expectType } from "tsd";
import { type Result } from "../result";
import { JSON } from "../json";

{
  expectType<Result<string>>(JSON.stringify(""));
  expectType<Result<unknown>>(JSON.parse(""));
}

test("stringify to ok on valid", () => {
  const $ = JSON.stringify({ foo: "bar" });
  expect($.ok).toBe(true);
  expect($.ok && $.value).toBe('{"foo":"bar"}');
});

test("stringify to err on invalid", () => {
  const cycle = {};
  // @ts-expect-error Creates object reference cycle.
  cycle.cycle = cycle;
  const $ = JSON.stringify(cycle);
  expect($.ok).toBe(false);
  expect($.error instanceof TypeError).toBe(true);
});

test("parse to ok on valid", () => {
  const $ = JSON.parse('["foo", "bar"]');
  expect($.ok).toBe(true);
  expect($.ok && $.value).toMatchObject(["foo", "bar"]);
});

test("parse to err on invalid", () => {
  const $ = JSON.parse("8731yhi12U!Y@G#JG#HB");
  expect($.ok).toBe(false);
  expect($.error instanceof SyntaxError).toBe(true);
});
