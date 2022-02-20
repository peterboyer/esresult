<p align="center">
  <img src="https://user-images.githubusercontent.com/8391902/147464722-786db152-e32d-429a-955a-d1e12960b8fc.png" alt="esresult" />
</p>

`esresult` is a zero-dependency, TypeScript-first utility for better
error-handling patterns in your code by making domain-specific errors an
**explicit** part of a function's public API.

By **forcing** function callers to deal with possible domain-specific errors you
can build more transparent and resilient functionality, and circumvent a
codebase littered with try/catch blocks or other emergent anti-patterns like
brittle catch-all blocks that handle too much.

Returning errors (instead of `throw`ing them) allows the caller to be aware of
all possible domain-specific error values of a function, and allows for static
type-checking to help enforce correctness of error-handling logic.

`esresult` supports:

- **intellisense** of a `Result`'s possible error types.
- **cause-chaining** to build domain-specific error causal-chains.
- **built-in data structure for error messages and info** for canonical error
  descriptions and/or contextual error information (e.g. data of a failing
  iteration in a loop).
- **ok result with warnings** for idiomatic handling of partial success cases
  where a valid value can be returned despite some non-critical errors.

## API

- [View Reference Docs + Examples](https://ptboyer.github.io/esresult/)
- [Example With and Without `esresult`](./EXAMPLE.md)

## Install

```shell
yarn add esresult
```

## Overview

Annotate your functions with a `Result` generic to explicitly define a
successful `Ok` type (returned with `ok(value)`) and optionally define all
possible domain-specific `Err` types that the function may return (returned with
`err(type)`).

```ts
import { Result, Ok, ok, Err, err, fromThrowable } from "esresult";
```



### Define only `Ok` type.

```ts
function foo(...): Result<number>
function foo(...): Result<Ok<number>>
function foo(...): Result<Result.Ok<number>>
```

> You may use `number` instead of `Ok<number>` as optional shorthand. You may
> also access Ok from Result via. Result.Ok.



### Or define both `Ok` and all possible `Err` types as a union.

```ts
function foo(...): Result<number, "INVALID" | "TOO_BIG">
function foo(...): Result<number, Err<"INVALID" | "TOO_BIG">>
function foo(...): Result<number, Result.Err<"INVALID" | "TOO_BIG">>
function foo(...): Result<number, Err<"INVALID"> | Err<"TOO_BIG">>
function foo(...): Result<number, Result.Err<"INVALID"> | Result.Err<"TOO_BIG">>
```

> Similar to Ok shorthand, you may pass a `type` instead of `Err<type>`. You
> may also access Err from Result via. Result.Err.



### Or also define a common `info` object for errors.

```ts
function foo(...): Result<number, "INVALID", { foo: string }>
function foo(...): Result<number, Err<"INVALID", { foo: string }>>
function foo(...): Result<number, Result.Err<"INVALID", { foo: string }>>
```

> `Err` can be directly provided with the `info` shape instead of using `Result`
> for shorthand.



### Or define both `Ok`, and different `info` objects per `Err` types.

```ts
function foo(...): Result<
  number,
  | Err<"INVALID", { a?: string }>
  | Err<"TOO_BIG" | "TOO_SMALL", { min?: number, max?: number }>
  | Err<"UNKNOWN", { a: string, b: string }>
>
```



### Use `ok(...)` and `err(...)` to return values and errors.

```ts
function foo(source: string): Result<number, "INVALID" | "TOO_BIG"> {
  const result = parseInt(source, 10);

  if (Number.isNan(result))
    return err("INVALID");

  if (result > 100)
    return err("TOO_BIG").$info({ max: 100 });

  return ok(result);
}
```



### Read a `Result`'s success or failure state, using `.ok`.

```ts
const $a = foo("100");

// if `ok` is false, Result is an error.
if (!$a.ok) return ...

// otherwise, Result is an ok value.
const a = $a.value;
```



### Create an Error chain, using `.$cause(...)`.

Rather than wrapping many statements in their own try/catch closures (which are
annoying when trying to use `const` for assignments), you can handle returned
`Result` objects and their values directly. `Err` objects support `.$cause(Err)`
to allow domain-space casual-chaining of errors that make debugging and
reporting a breeze.

```ts
const $a = foo("100");
if (!$a.ok) {
  // return a new error, and track its cause
  return err("FOO_ERROR").$cause($a);
}
const a = $a.value;
```



### Or continue with default value, using `.or(...)` and `.orUndefined()`.

Many libraries opt to simplify their API by returning `undefined` (or `null`)
when encountering an error rather than `throw`ing or otherwise reporting details
of a failure. With a `Result` the API caller can choose to handle an error with
`undefined` or with a value of the matching `Ok` type.

```ts
const a = foo("100").orUndefined(); // default to undefined
const a = foo("100").or(50); // default to different number
const a = foo("100").or("50"); // ts: error: "50" is not of type: number
```



### Or handle a specific error type, using `.error`.

```ts
const $a = foo("100");
if ($a.error === "FOOBAR") {
//               ^ ts: error: can only be: "INVALID" | "TOO_BIG"
  return err("CRITICAL_ERROR").$cause($a);
}
const a = $a.orUndefined(); // gracefully continue
```



### Enrich your Errors, using `.$info(...)` and `.$message(...)`.

All other Result/error-handling libraries only support a basic error primitive
(e.g. string, Error-object, etc.) leaving the developer to implement their own
interfaces to store possible contextual information (e.g. status codes, failing
object, etc.). Because these use-cases are so common, `esresult`'s `Err` object
supports adding this information out-of-the-box.

```ts
const $ = err("QUERY_ERROR")
  .$cause($response) // details on the cause, e.g. network error?
  .$info({ url: requestUrl, query, variables }) // relevant context details
  .$message("Unable to communicate with the server.") // human readable

$.cause
//      ^ type: Err<unknown, unknown> (causal chains are not generic)
$.info.
//      ^ intellisense: "url" | "query" | "variables"
$.message
//        ^ type: string
```



### Ok with partial errors, using `.ok`.

```ts
function foo(...): Result<Ok<number, Err<>>>
```

Sometimes it is useful to provide a successful value AND output any errors or
warnings that are non-critical (e.g. parsing many items, and returning
successful items as an array, but reporting failed items as an array of errors).

> For convenience, if the given array of errors is empty, `.partialErrors` will
evaluate as `undefined`. This allows for expressions like `!$.partialErrors` to
check for any partial errors, instead of the needless verbose
`!$.partialErrors?.length`.

```ts
const okItems: FooItem[] = [];
const itemWarnings: Err<"INVALID" | "OUT_OF_RANGE">[] = [];

const $ = ok(okItems).$warnings(itemErrors);
const $ = ok(okItems, { warnings: itemErrors });

$.value
//    ^ type: FooItem[]
$.warnings
//         ^ type: undefined | Err<"INVALID" | "OUT_OF_RANGE">[]
```



### Wrap a function that can throw, using `.fromThrowable(...)`.

```ts
import { fromThrowable } from "esresult";

// throwable
function fn() { throw new Error(...); }

// wrap
const safeFn = fromThrowable(fn);

// safely call with Result
const $result = safeFn(...);

// thrown error is available as `$result.error`
if (!$result.ok) return err(...).$cause($result);
```



### Fallback to unstructured Error, using `err.primitive(...)`.

If you're unable to use `fromThrowable` to wrap a throwing function, or you just
really don't want to use a structured error type, you can create an primitive
`err` using anything for its `error` value.

```ts
// primitive/unstructured err
const $ = err.primitive(new TypeError(...));

$.ok      // false
$.error   // TypeError
```



## Motivation

Heavily inspired by:
- [`neverthrow`](https://www.npmjs.com/package/neverthrow)
  ([npm](https://www.npmjs.com/package/neverthrow),
  [github](https://github.com/supermacro/neverthrow))
- Rust's [`Result`](https://doc.rust-lang.org/std/result/enum.Result.html) type.

## License

Copyright (C) 2022 Peter Boyer

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
