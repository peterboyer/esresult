import { fromThrowable } from "../from-throwable";

export const parse = fromThrowable(
  JSON.parse as (
    text: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown
  ) => unknown
);

export const stringify = fromThrowable(JSON.stringify);

const JSONSafe = {
  parse,
  stringify,
};

export { JSONSafe as JSON };
