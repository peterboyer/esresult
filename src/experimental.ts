import { expectType } from "tsd";

interface Ok<T> {
  value: T | never;
  error: undefined;
}

interface Err<E> {
  error: E | never;
  meta?: object;
  message?: string;
}

// interface ResultFn {

// }

interface ResultMethods<T> {
  or(value: T): T;
  orUndefined(): undefined;
}

export type Result<T = void, E = never> = Ok<T> | Err<E>;

export type ResultAsync<T = void, E = never> = Promise<Result<T, E>>;

//

export function Result<T extends { ok: Ok }, Ok>(input: T): Result<Ok, never>;
export function Result<E extends { error: Error }, Error extends string>(
  input: E
): Result<never, Error>;
export function Result<T, E>(input: { ok: T } | { error: E }): Result<T, E> {
  if ("ok" in input) return { value: input.ok, error: undefined as never };
  return { error: input.error, value: undefined as never };
}

{
  // @ts-expect-error Result<number> not assignable to Result<string>.
  expectType<Result<string>>({} as Result<number>);
}

{
  // @ts-expect-error Result<number> not assignable to Result<string>.
  expectType<Result<string>>(Result({ ok: 123 }));
}

function parse(input: string): Result<number, "Invalid"> {
  if (!input) {
    // @ts-expect-error Result<string> not assignable to Result<number>.
    return Result({ ok: "incompatible" });
  }

  const output = parseInt(input);

  if (Number.isNaN(output)) {
    return Result({ error: "Invalid" });
  }

  return Result({ ok: output });
}

function main() {
  const $result = parse("foobar");

  // @ts-expect-error .meta should not be accessible yet.
  console.log($result.meta);
  // @ts-expect-error .message should not be accessible yet.
  console.log($result.message);

  if ($result.error) {
    return $result.error;
  }

  $result.value;
}

//

import * as _result from ".";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Async = _result.ResultAsync;
}

export default Result;
