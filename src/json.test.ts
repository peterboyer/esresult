import * as JSON from "./json";
import { expectType } from "tsd";

////////////////////////////////////////////////////////////////////////////////

describe("parse", () => {
  test("correct success value", () => {
    const $ = JSON.parse('{"foo":"bar"}');

    if ($.error) {
      return;
    }

    expect($).toMatchObject({
      value: { foo: "bar" },
    });

    const [value] = $;
    expectType<unknown>(value);
  });

  test("correct error value", () => {
    const $ = JSON.parse("input");
    expect($.error?.type.thrown).toBeInstanceOf(SyntaxError);

    if ($.error) {
      expectType<Result.Error.ThrownType>($.error.type);
      return;
    }
  });
});

describe("stringify", () => {
  test("correct success value", () => {
    const $ = JSON.stringify({ foo: "bar" });
    if ($.error) {
      return;
    }

    expect($).toMatchObject({
      value: '{"foo":"bar"}',
    });

    const [value] = $;
    expectType<string>(value);
  });

  test("correct error value", () => {
    const $ = JSON.stringify("input");
    if ($.error) {
      expectType<Result.Error.ThrownType>($.error.type);
      return;
    }
  });
});
