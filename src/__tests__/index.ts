import { expectType } from "tsd";

////////////////////////////////////////////////////////////////////////////////

import Result, { JSON, type Thrown } from "esresult";

////////////////////////////////////////////////////////////////////////////////

describe("example", () => {
  interface User {
    id: string;
    name: string;
  }

  const users: Record<string, User> = {
    "1": { id: "1", name: "Foo" },
  };

  async function getUser(
    id: string
  ): Result.Async<User, "IdInvalid" | "NotFound"> {
    if (!id) return Result.error("IdInvalid");

    const user = users[id];
    if (!user) return Result.error("NotFound");

    return Result(user);
  }

  test("value", async () => {
    const $user = await getUser("1");
    expect($user.error).toBeUndefined();
    expect($user.orUndefined()).toMatchObject({ id: "1", name: "Foo" });
    expectType<() => User>($user.orThrow);
  });

  test("error", async () => {
    const $ = await getUser("2");
    expect($.error).toMatchObject({
      type: "NotFound",
      meta: undefined,
      cause: undefined,
    });

    if ($.error) {
      expectType<"IdInvalid" | "NotFound">($.error.type);
      expectType<undefined>($.error.meta);
      expectType<() => never>($.orThrow);
    }

    const defaultUser: User = { id: "backup", name: "Backup" };
    expect($.or(defaultUser)).toMatchObject(defaultUser);
    expect($.orUndefined()).toBeUndefined();
  });

  function fnThrow(): number {
    throw new Error();
  }

  test("fn", () => {
    function fnThrow(): number {
      throw new Error();
    }

    const fnSafe = Result.fn(fnThrow);
    const $ = fnSafe();

    expect($.error?.type.thrown).toBeInstanceOf(Error);

    if ($.error) {
      expectType<Thrown>($.error.type);
      expectType<undefined>($.error.meta);
    }
  });

  test("try", () => {
    const $ = Result.try(() => fnThrow());

    expect($.error?.type.thrown).toBeInstanceOf(Error);

    if ($.error) {
      expectType<Thrown>($.error.type);
      expectType<undefined>($.error.meta);
    }
  });
});

////////////////////////////////////////////////////////////////////////////////

describe("json", () => {
  test("parse", () => {
    const $ = JSON.parse("kajsdfhiku1h");
    expect($.error?.type.thrown).toBeInstanceOf(Error);

    if ($.error) {
      Result.error("ParseFailed", { cause: $ });
    } else {
      const [value] = $;
      expectType<unknown>(value);
    }
  });

  test("stringify", () => {
    const $ = JSON.stringify({ foo: "bar" });
    expect($.orUndefined()).toBe('{"foo":"bar"}');

    if ($.error) {
      Result.error("ParseFailed", { cause: $ });
    } else {
      const [value] = $;
      expectType<string>(value);
    }
  });
});
