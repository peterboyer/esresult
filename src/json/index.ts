import { fromThrowable } from "../from-throwable";

export const parse = fromThrowable(JSON.parse);

export const stringify = fromThrowable(JSON.stringify);

const JSONSafe = {
  parse,
  stringify,
};

export { JSONSafe as JSON };
