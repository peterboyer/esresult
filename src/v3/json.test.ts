import { Primitive } from "v3";
import { parse, stringify } from "v3/json";
import { expectType } from "tsd";

//

() => {
  const $ = parse("input");
  if ($.error) {
    expectType<Primitive>($.error);
    return $;
  }

  const [value] = $;
  expectType<unknown>(value);
};

() => {
  const $ = stringify("input");
  if ($.error) {
    expectType<Primitive>($.error);
    return $;
  }

  const [value] = $;
  expectType<string>(value);
};
