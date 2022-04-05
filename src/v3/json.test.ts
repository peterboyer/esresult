import { Thrown } from "v3";
import { parse, stringify } from "v3/json";
import { expectType } from "tsd";

//

() => {
  const $ = parse("input");
  if ($.error) {
    expectType<Thrown>($.error.type);
    return $;
  }

  const [value] = $;
  expectType<unknown>(value);
  return;
};

() => {
  const $ = stringify("input");
  if ($.error) {
    expectType<Thrown>($.error.type);
    return $;
  }

  const [value] = $;
  expectType<string>(value);
  return;
};
