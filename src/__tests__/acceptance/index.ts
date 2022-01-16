import { ok, err, fromThrowable } from "esresult";

describe("example", () => {
  const users: Record<string, { id: string; name: string }> = {
    "1": { id: "1", name: "Foo" },
  };

  function getUser(id: string) {
    if (!id) return err("INVALID_ID");
    const user = users[id];
    if (!user) return err("NOT_FOUND");
    return ok(user);
  }

  test("ok", () => {
    const $user = getUser("1");
    expect($user.ok).toBe(true);
    expect($user.orUndefined()).toMatchObject({ id: "1", name: "Foo" });
  });

  test("err", () => {
    const $user = getUser("2");
    expect($user.ok).toBe(false);
    expect($user.error === "NOT_FOUND").toBe(true);
    expect($user.orUndefined()).toBeUndefined();
    expect($user.or({ id: "backup", name: "Backup" })).toMatchObject({
      id: "backup",
      name: "Backup",
    });
  });

  test("fromThrowable", () => {
    const safeJSONParse = fromThrowable(JSON.parse);
    const $result = safeJSONParse("hbcdsjkht238471y2341234");
    expect($result.ok).toBe(false);
  });
});

import { JSON as tJSON } from "esresult/json";

describe("json", () => {
  test("parse/stringify", () => {
    const $parse = tJSON.parse("dfankjn3k12jnk123");
    expect($parse.ok).toBe(false);
    const $stringify = tJSON.stringify({ foo: "bar" });
    expect($stringify.ok).toBe(true);
    expect($stringify.ok && $stringify.value).toBe('{"foo":"bar"}');
  });
});
