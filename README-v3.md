<p align="center">
  <img src="https://user-images.githubusercontent.com/8391902/147464722-786db152-e32d-429a-955a-d1e12960b8fc.png" alt="esresult" />
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/esresult">NPM</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/peterboyer/esresult/issues">Issues</a>
</div>
<br/>

# Table of Contents

- [What is esresult?](#what-is-esresult)
- [Why does esresult exist?](#why-does-esresult-exist)
  - [Using esresult instead!](#using-esresult-instead)
- [How does esresult work?](#how-does-esresult-work)
- [Comparison to existing libraries](#comparisons)
- [Installation](#installation)
- [Usage](#usage)
  - [With no errors](#with-no-errors)
  - [With one error](#with-one-error)
  - [With many errors](#with-many-errors)
  - [With detailed errors](#with-detailed-errors)
  - [Async functions](#async-functions)
  - [Chaining errors](#chaining-errors)
  - [Wrap throwable functions (`.fn`)](#wrap-throwable-functions-fn)
  - [Execute throwable functions (`.try`)](#execute-throwable-functions-try)
- [Helpers](#helpers)
  - [JSON](#json)
- [License](#license)

<br/>

# What is `esresult`?

`esresult` (ECMA-Script Result) is a tiny, zero-dependency, TypeScript-first,
result/error utility.

It helps you easily represent errors as part of your functions' signatures so
that:

- you don't need to maintain [`@throws` jsdoc
  annotations](https://jsdoc.app/tags-throws.html),
- you don't need to write [`Error` subclasses
  boilerplate](https://javascript.info/custom-errors),
- you don't need to return arbitary values like `-1`
  ([`Array.findIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#return_value))
  or `null`
  ([`String.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match#return_value))
  to indicate an error,
- you don't need to fallback to `let` just to use a variable assigned from
  [within a `try/catch` closure](https://stackoverflow.com/a/43090730).

<br/>

# Why does `esresult` exist?

You will be writing a lot of functions.

```ts
function fn() {
    ...
}
```



Your functions will often need to return some kind of value.

```ts
function fn(): string {
    return value;
}
```



And will probably need to report errors of some kind.

```ts
function fn(): string {
    if (condition)
        throw new Error("NotFound");
    return value;
}
```



You will probably have many different types of errors, so you make subclasses of
`Error`.

```ts
class NotFoundError extends Error {}
class DatabaseQueryFailedError extends Error {}

function fn(): string {
    if (condition)
        throw new NotFoundError();
    if (condition)
        throw new DatabaseQueryFailedError();
    return value;
}
```



Traditionally, you will use `throw` to report error; and it would be best to
document this behaviour somehow.

```ts
class NotFoundError extends Error {}
class DatabaseQueryFailedError extends Error {}

/**
 * @throws {NotFoundError} If the record can't be found.
 * @throws {DatabaseQueryError} If there is an error communicating with the database.
 * @throws {FooError} An error we forgot to remove from the documentation many releases ago.
 */
function fn(): string {
    if (condition)
        throw new NotFoundError();
    if (condition)
        throw new DatabaseQueryFailedError();
    return value;
}
```



If the **caller** wants to act conditionally for a particular error we also need
to import those error classes for comparison.

```ts
import { fn, NotFoundError } from "./fn";

try {
    const value = fn();
} catch (e) {
    if (e instanceof NotFoundError) {
        ...
    }
}
```



If the value returned by `fn()` (from within the `try` block) is needed later,
the **caller** needs to use `let` outside of the `try` block to then assign it
from within.

```ts
import { fn, NotFoundError } from "./fn";

let value: string | undefined = undefined;
try {
    value = fn();
} catch (e) {
    if (e instanceof NotFoundError) {
        ...
    }
}

console.log(value);
            ^ // string | undefined
```



This "simple" function:

- needs **too much boilerplate code** to express errors,
- needs the **caller** to read the docs to learn of possible error behaviour so
  that it may safely handle these error-cases,
- needs the **caller** to litter their code with let & try/catch blocks to
  properly scope returned values,
- needs the **caller** to perform additional imports of error subclasses just to
  compare error instances,
- AND, if the function adds (or removes) error behaviour, **static analysis will
  not notice**.

<br/>

## Using `esresult` instead!

What if we could instead reduce all this into something smaller and more
human-friendly with `esresult`?

- No error subclasses needed, and are now part of the function's signature.

```ts
import Result from "esresult";

function fn(): Result<string, "NotFound" | "DatabaseQueryFailed"> {
    if (condition)
        return Result.error("NotFound");
    if (condition)
        return Result.error("DatabaseQueryFailed");
    return Result(value);
}
```

- No need to import anything else but the `fn` itself.
- No complications with let + try/catch to handle a particular error.
- All error types can be seen via intellisense/autocompletion.
- Ergonomically handle error cases and default value behaviours.

```ts
import { fn } from "./fn"

const $value = fn();
      ^ // ? The Result object that may be of Value or Error.

if ($value.error?.type === "NotFound") {
                  ^ // "NotFound" | "DatabaseQueryFailed" | undefined
}

const value = $value.orUndefined();
      ^ // string | undefined
```



And if the function doesn't have any known error cases yet (as part of its
signature), you can access the successful value directly, without needing to
check `error` (it will always be `undefined`).

```ts
import Result from "esresult";

function fn(): Result<string> {
    return Result(value);
}

const [value] = fn();
       ^ // string
```



And once you add (or remove) an error case, TypeScript will be able let you
know.

```ts
import Result from "esresult";

function fn(): Result<string, "Invalid"> {
    if (isInvalid)
        return Result.error("Invalid");
    return Result(value);
}

const [value] = fn();
      ^ // ? Possible ResultError is not iterable! (You must handle the error case first.)
```

<br/>

# How does `esresult` work?

`esresult` default exports `Result`, which is both a Type and a Function, as
explained below.



**`Result` is a type generic** that accepts `Value` and  `Error` type parameters
to create a [discriminable
union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
of:

- An "Ok" Result,
  - which will **always** have a **`undefined`** `.error` property,
- An "Error" Result,
  - which will **always** have a **non-`undefined`** `.error` property,
  - and **does not have a `.value` property**, therefore an "Ok" Result **must
  be narrowed/discriminated first**.



This means that checking for the **truthiness** of `.error` will easily
discriminate between "Ok" and "Error" Results.

- If **`never`** is given for `Result`'s `Value` parameter, only a union of
  "Error" is produced.
- Vice versa, if **`never`** is given for `Result`'s `Error` parameter, only a
  union of "Value" is produced.



**`Result` is a function**, which produces an "Ok" Result object using the given
`value` parameter, whereby `Error` is `never`.

`Result.error` is a function that produces an "Error" Result object using the
given `error` parameter, whereby `Value` is `never`.



"Error" Result's can also contain `.meta` data about the error (e.g. current
iteration index/value, failed input string, etc.).

- An Error's `meta` type can be defined via a tuple: `Result<never, ["MyError",
  { foo: string }]>`
- An "Error" Result object can be instantiated similarly:
  `Result.error(["MyError", { foo: "bar" }]);`



`esresult` works with simple objects as returned by `Result` and `Result.error`,
of which follow a simple prototype chain:

- "Ok" Result object has, `Result.prototype` -> `Object.prototype`
- "Error" Result object has, `ResultError.prototype` -> `Result.prototype` ->
  `Object.prototype`



The `Result.prototype` defines methods such as `or()`, `orUndefined()`, and
`orThrow()`.

<br/>

# Comparisons

How does `esresult` compare to other result/error handling libraries?

- Overall `esresult`:
  - is mechanically simple to discriminate on a single `.error` property.
  - supports a simple (and fully typed) error shape mechanism that naturally
    supports auto-completion.
  - supports causal chaining out-of-the-box so you don't need to use another
    library.
  - relies on simple functions (or, orUndefined, etc) to reduce value-mapping
    complexity in favour of native TypeScript control flow.

|                                    | esresult            | [neverthrow](https://github.com/supermacro/neverthrow) | [node-verror](https://github.com/joyent/node-verror) | [@badrap/result](https://github.com/badrap/result) | [type-safe-errors](https://github.com/wiktor-obrebski/type-safe-errors) | [space-monad](https://github.com/AlexGalays/space-monad) | [typescript-monads](https://github.com/patrickmichalina/typescript-monads) | [monads](https://github.com/sniptt-official/monads/tree/main/lib/result) | [ts-pattern](https://github.com/gvergnaud/ts-pattern) | [boxed](https://github.com/swan-io/boxed) |
| ---------------------------------- | ------------------- | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------- |
| Result discrimination              | **.error**          | .isOk() .isErr()                                       | N/A                                                  | .isOk .isErr                                       | as inferred                                                  | .isOk()  .isResult($)                                    | .isOk() .isErr()                                             | .isOk() .isErr()                                             | as inferred                                           | .isOk() .isErr()                          |
| Free value access if no error def. | **YES**             | No                                                     | N/A                                                  | No (must always discriminate; for errors too!)     | **YES**                                                      | No                                                       | No                                                           | No                                                           | **YES**                                               | No                                        |
| Error shapes (type/meta)           | **YES**             | No                                                     | **YES**                                              | No (forces of type `Error`)                        | No (encourages error instances)                              | No                                                       | No                                                           | No                                                           | No                                                    | No                                        |
| Error causal chaining              | **YES**             | No                                                     | **YES**                                              | No                                                 | No                                                           | No                                                       | No                                                           | No                                                           | No                                                    | No                                        |
| Error type autocomplete            | **YES**             | No                                                     | No (relies on throwing)                              | No                                                 | **YES** (standard inferred)                                  | No                                                       | No                                                           | No                                                           | **YES** (standard inferred)                           | No                                        |
| Wrap unsafe functions              | **YES**             | **YES**                                                | N/A                                                  | No                                                 | No                                                           | No                                                       | No                                                           | No                                                           | N/A                                                   | No                                        |
| Execute one-off unsafe functions   | **YES**             | No                                                     | N/A                                                  | No                                                 | No                                                           | No                                                       | No                                                           | No                                                           | N/A                                                   | No                                        |
| Async types                        | **YES**             | **YES**                                                | N/A                                                  | No                                                 | No                                                           | No                                                       | No                                                           | No                                                           | N/A                                                   | No                                        |
| Wrap unsafe async functions        | **YES**             | **YES**                                                | N/A                                                  | No                                                 | No                                                           | No                                                       | No                                                           | No                                                           | N/A                                                   | No                                        |
| value access                       | **or, orUndefined** | map, mapErr, orElse (not type restricted)              | N/A                                                  | unwrap (could throw if not verbose)                | map, mapErr                                                  | map, orElse                                              | unwrap unwrapOr                                              | unwrap (throws), unwrapOr                                    | N/A                                                   | match (not type restricted)               |
| orThrow (panic)                    | **YES**             | No                                                     | N/A                                                  | **"**                                              | No                                                           | No                                                       | No                                                           | No                                                           | **YES**, (exhaustive)                                 | No                                        |
<br/>


# Installation

```bash
$ npm install esresult
```

<br/>

# Usage

## With no errors

- A simple function that returns a `string` without any defined errors.

```ts
import Result from "esresult";

function fn(): Result<string> {
  return Result("string");
}
```

- Because the `Result` signature has no defined errors the caller doesn't need
  to handle anything else.

```ts
const [value] = fn();
```

<br/>

## With one error

- A function that returns a string or a `"NotFound"` error.

```ts
function fn(): Result<string, "NotFound"> {
  return Result("string");
  return Result.error("NotFound");
}
```

- The returned `Result` may be an error, as determined by its `.error` property.

<br/>

### ... use value, or a default value on error

- You may provide a default value of matching type to the expected value of the
  Result.

```ts
const valueOrDefault = fn().or("default");
```

<br/>

### ... use value, or `undefined` on error

- Or you may default to `undefined` in the case of an error.

```ts
const valueOrUndefined = fn().orUndefined();
```

<br/>

### ... use value, or `throw` on error

- Or you may **crash your program when in an undefined state that should never
  happen** (e.g. initialisation code).
  - Don't use `.orThrow` with try/catch blocks as this defeats the purpose of
    the `Result` object itself.


```ts
const value = fn().orThrow();
```

<br/>

### ... use value, after handling error

- You can use the `Result` object directly to handle specific error cases and
  create [error chains](#error-chains).

```ts
const $ = fn();
if ($.error)
  return Result.error("FnFailed", { cause: $ })

const [value] = $;
```

<br/>

## With many errors

- You can provide a union of error types to define many possible errors.

```ts
function fn(): Result<string, "NotFound" | "NotAllowed"> {
  return Result("string");
  return Result.error("NotFound");
  return Result.error("NotAllowed");
}
```

```ts
const $ = fn();

if ($.error) {
  $.error.type
          ^ // "NotFound" | "NotAllowed"
}
```

<br/>

## With detailed errors

- You can add typed `meta` information to allowing callers to parse more from
  your error.
  - Provide a tuple with the error type and the meta type/shape to use.


```ts
function fn(): Result<
  string,
    | "NotFound"
    | "NotAllowed"
    | ["QueryFailed", { query: Record<string, unknown>; }]
> {
  return Result("string");
  return Result.error("NotFound");
  return Result.error("NotAllowed");
  return Result.error(["QueryFailed", { query: { a: 1, b: 2 } }])
                      ^ // ? Providing a tuple that matches the definition's shape.
}
```

- To access the `meta` property with the correct type, you will need to
  discriminate by `.error.type` first.

```ts
const $ = fn();

if ($.error) {
  if ($.error.type === "QueryFailed") {
    $.error.meta
            ^ // { query: Record<string, unknown> }
  } else {
    $.error.meta
            ^ // undefined ? Only "QueryFailed" has a meta property definition.
  }
}
```

<br/>

## Async functions

- Use `Result.Async` as a shortcut for `Promise<Result>`.

```ts
async function fn(): Result.Async<string, "Error"> {
  return Result("string");
  return Result.error("Error");
}
```

- Results are just ordinary objects that are perfectly compatible with
  async/await control flows.

```ts
const $ = await fn();
const value = $.or("default");
const value = $.orUndefined();

if ($.error) {
    return;
}

const [value] = $;
```

<br/>

## Chaining errors

- Often you need will have a function calling another function that could also
  fail, upon which the caller will fail also.
  - You can provide a `cause` property to your returned error that will begin to
    form an error chain of domain-specific errors.
  - Error chains are more useful than a traditional stack-traces because they
    are specific to your program's domain rather than representing an
    programming error resulting in undefined program behaviour.

```ts
function main(): Result<string, "FooFailed"> {
    const $foo = fn();
          ^ // ? Returns a Result that may be an error.

    if ($foo.error)
        return Result.error("FooFailed", { cause: $foo });

    return Result(value);
}
```

<br/>

## Wrap throwable functions (.fn)

- Use `Result.fn` to wrap unsafe functions (including `async` functions) that
  `throw`.
  - The return type of the wrapped function is correctly inferred as the `Value`
    of the Result return signature.
  - If the function `throw`s, the Error is captured in a `{ thrown: Error }`
    container.

```ts
const parse = Result.fn(JSON.parse);
      ^ // (text: string, ...) => Result<unknown, Thrown>

const $ = parse(...);
      ^ // Result<unknown, Thrown>
```

<br/>

## Execute throwable functions (.try)

- A shortcut method for `Result.fn(() => {})()`; offers a simple replacement for
  a try/catch block.
  - Accepts a function with no arguments and **immediately invokes it** and
    forwards its return value (if any) as a Result.

```ts
const $ = Result.try(() => {});
      ^ // Result<void, Thrown>

const $ = Result.try(async () => {});
      ^ // Result.Async<void, Thrown>

const $ = Result.try(() => JSON.stringify(...));
      ^ // Result<string, Thrown>
```

<br/>

# Helpers

## JSON

- The built-in JSON `.parse` and `.stringify` methods are frequently used, so
  `esresult` offers a pre-wrapped drop-in `JSON` object replacement.
  - You can achieve the same result with `Result.fn(JSON.parse)` etc.

```ts
import { JSON } from "esresult";

const $ = JSON.parse(...);
      ^ // Result<unknown, Thrown>

const $ = JSON.stringify(...);
      ^ // Result<string, Thrown>
```

<br/>

# License

Copyright (C) 2022 Peter Boyer

esresult is licensed under the [MIT License](./LICENSE), a short and simple
permissive license with conditions only requiring preservation of copyright and
license notices. Licensed works, modifications, and larger works may be
distributed under different terms and without source code.
