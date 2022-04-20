<p align="center">
  <img src="https://user-images.githubusercontent.com/8391902/147464722-786db152-e32d-429a-955a-d1e12960b8fc.png" alt="esresult" />
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/esresult">NPM</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/peterboyer/esresult/issues">Issues</a>
</div>


# Table of Contents

[TOC]

# What is esresult?

`esresult` is a tiny, zero-dependency, TypeScript-focused, result/error utility.

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
- you don't need to fallback to `let` just to use a variable assigned from [within a
  `try/catch` closure](https://stackoverflow.com/a/43090730).



# Why use esresult?

You will end up writing lots of functions.

```ts
function fn() {}
```



Your functions will probably return some kind of value.

```ts
function fn(): string {
    return value;
}
```



Some functions will probably need to report errors.

```ts
function fn(): string {
    if (condition) throw new Error("NotFound");
    return value;
}
```



Most of the time you will have many different types of errors, so you make subclasses of `Error`.

```ts
class NotFoundError extends Error {}
class DatabaseQueryFailedError extends Error {}

function fn(): string {
    if (condition) throw new NotFoundError();
    if (condition) throw new DatabaseQueryFailedError();
    return value;
}
```



Traditionally, you will use `throw` to report errors. It would be best to document this behaviour somewhere; unfortunately documentation decays very quickly.

```ts
class NotFoundError extends Error {}
class DatabaseQueryFailedError extends Error {}

/**
 * @throws NotFoundError if the record can't be found.
 * @throws DatabaseQueryError if there is an error communicating with the database.
 */
function fn(): string {
    if (condition) throw new NotFoundError();
    if (condition) throw new DatabaseQueryFailedError();
    return value;
}
```



If the **caller** wants to act conditionally for a particular error, we need to import those error classes too for comparison.

```ts
import { fn, NotFoundError } from "./fn";

try {
    const value = fn();
} catch (e) {
    if (e instanceof NotFoundError) {
       // ... 
    }
}
```



If the `value` returned by `fn()` (from within the `try` block) is needed later, the **caller** needs to use `let` outside of the `try` block and to then later assign to it.

```ts
import { fn, NotFoundError } from "./fn";

let value: string | undefined = undefined;
try {
    value = fn();
} catch (e) {
    if (e instanceof NotFoundError) {
       // ... 
    }
}

console.log(value);
// string | undefined
```



This "simple" function:

- ended up to **too much boilerplate code** to express errors,
- the **caller** needed to be hyper-aware of possible error behaviour so that it may safely handle these error-cases,
- the **caller** needed to litter their code with try/catch blocks that juggle the returned value around,
- the **caller** needed to perform additional imports just to compare error instances,
- AND, if the function decides to add or remove error behaviour, type-safety and **static analysis will not notice**.



What if we could instead reduce this something smaller and more human-friendly -- using ?

```ts
import Result from "esresult";

function fn(): Result<string, "NotFound" | "DatabaseQueryFailed"> {
    if (condition) return Result.error("NotFound");
    if (condition) return Result.error("DatabaseQueryFailed");
    return Result(value);
}
```

```ts
import { fn } from "./fn"

const $value = fn();
if ($value.error?.type === "NotFound") {
    // ...
}

const value = $value.orUndefined();
// string | undefined
```



And if the function doesn't have any known error cases yet, you can access the successful value directly.

```ts
import Result from "esresult";

function fn(): Result<string> {
    return Result("hello");
}

const [value] = fn();
// string ("hello")
```



And once you add (or remove) an error case, TypeScript will let you know.

```ts
import Result from "esresult";

function fn(): Result<string, "HavingABadDay" | "HavingAHorribleDay"> {
    if (isBadDay) return Result.error("HavingABadDay");
    return Result("hello");
}

const [value] = fn();
   // ^ possible ResultError is not iterable (you need to handle the error)
```



And all possible errors are part of the function's return signature, and can be auto-completed!

```ts
const $value = fn();

$value.error?.type
		   // ^ "HavingABadDay" | "HavingAHorribleDay" | undefined
```



# Comparison

How does this compare to other error handling libraries?

- [vs `neverthrow`](#vs-neverthrow)
- [vs `node-verror`](#vs-node-verror)
- [vs `@badrap/result`](#vs-badrap-result)
- [vs `type-safe-errors`](#vs-type-safe-errors)
- [vs `space-monad`](#vs-space-monad)
- [vs `typescript-monads`](#vs-typescript-monads)
- [vs `monads`](#vs-monads)
- [vs `ts-pattern`](#vs-ts-pattern)
- [vs `boxed`](#vs-boxed)



# Installation

```bash
$ npm install esresult
```



# Basic Usage

## `Result<Value>`

Creating and calling a simple function that returns a `string` without no
defined errors.

```ts
import Result from "esresult";

function fn(): Result<string> {
  return Result("hello");
}
```

### use value directly

- Because the `Result` signature has no defined errors the caller doesn't need to handle anything else.

```ts
const [value] = fn();
```



## `Result<Value,Error>`

Creating and calling a simple function returns a `string` with possible, defined
errors.

```ts
import Result from "esresult";

function fn(s: string): Result<string, "Empty"> {
  if (!s) {
    return Result.error("Empty");
  }
  return Result(s);
}
```

### use value or a default value (if error)

```ts
const valueOrDefault = fn(_).or("default");
```

### use value or `undefined` (if error)

```ts
const valueOrUndefined = fn(_).orUndefined();
```

### use value after handling error

- You can use the `Result` object directly to handle specific error cases and create [error chains](#error-chains).

```ts
const $ = fn(_);
if ($.error) {
  return Result.error("FnFailed", { cause: $ })
}

const [value] = $;
```



# Result

A `Result` is a generic that produces a union of "Value" and "Error" values that
are discriminated based on the `.error` value:

- A "Value" will always have `.error === undefined`.
- A "Error" will always have `.error !== undefined`.
- A "Error" does not have a `.value` property.



## fn with no errors

```ts
// definition
function fn(): Result<string> {
  return Result("string");
}
```

```ts
// calling
const $ = fn();
const value = $.or("default");
const value = $.orUndefined();

// Able to easily access value.
const [value] = $;
```



## fn with one error

```ts
// definition
function fn(): Result<string, "NotFound"> {
  return Result("string");
  return Result.error("NotFound");
}
```

```ts
// calling
const $ = fn();
const value = $.or("default");
const value = $.orUndefined();

// Must handle a possible error before accessing value.
if ($.error) { return; }

// Able to access value after filtering out possible error.
const [value] = $;
```



## fn with many errors

```ts
// definition
function fn(): Result<string, "NotFound" | "NotAllowed"> {
  return Result("string");
  return Result.error("NotFound");
  return Result.error("NotAllowed");
}
```

```ts
// calling
const $ = fn();

if ($.error) {
  $.error.type // "NotFound" | "NotAllowed"
}
```



## fn with detailed errors

```ts
// definition
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
}
```

```ts
// calling
const $ = fn();

if ($.error) {
  if ($.error.type === "QueryFailed") {
    $.error.meta // { query: Record<string, unknown> }
  } else {
    $.error.meta // undefined
  }
}
```



## async fn

Use `Result.Async` as a shortcut for `Promise<Result>`.

```ts
// definition
async function fn(): Result.Async<string, "Error"> {
  return Result("string");
  return Result.error("Error");
}
```

```ts
// calling
const $ = await fn();
const value = $.or("default");
const value = $.orUndefined();

if ($.error) { /* ... */ return; }
const [value] = $;
```



## error chains



```ts
function fn(): Result<string, "Failed"> {
  return Result.error("Failed");
}

function main(): Result<string, "FooFailed"> {
  const $foo = fn();
  if ($foo.error) {
    return Result.error("FooFailed", { cause: $foo });
  }
}
```



# Other

## Result of Async Function

Call your function to receive a `Result` object with which you can check for
errors before using your value, helping you write safer code with complete
awareness of all possible (expected) error types without having to refer to
documentation.

```ts
// if error, use a default value
const value = foo("123").or("DefaultValue");
```

```ts
// or: if error, use undefined to indicate failure
const value = foo("123").orUndefined();
```

```ts
// or: deal with the Result directly
const $result = foo("123");
```

The `Result` object is a union of an "Ok" state and all possible "Error" states
(as annotated on your function) which can be discriminated upon using the
`$.error` property (which is always `undefined` for successful operations).

```ts
if ($result.error) {
  // if error, return a new error and chain its cause
  return Result.error("FooFailed", { $cause: $result });

  // or: handle a specific error
  if ($result.error.type === "EmptyValue") {
    ...
  }
}
```

Once the `Result` object has been type-narrowed to only an "Ok" state, you can
safely access it's success value.

```ts
// value from $.value property
const value = $result.value;
```

```ts
// value by destructuring the $.value property
const { value } = $result;
```

```ts
// value by tuple-destructure (allowing for easy renaming)
const [myValue] = $result;
```

You can provide a union of errors to `Result` to annotate many possible error
states of the function.

```ts
function bar(): Result<MyType, "ValueInvalid" | "ValueTooBig"> {
  return Result.error("ValueInvalid");
  return Result.error("ValueTooBig");
}
```

Often you will want to include metadata/details about an error, you can provide
a error + meta data tuple.

```ts
function bar(): Result<
  MyType,
  | ["ParseError", { line: number, column: number }]
  | ["FormatError", { conflictId?: string }]
  | "RandomError"
> {
  return Result.error("ParseError", { line: 10, column: 12 });
  return Result.error("FormatError", { conflictId: "abc123" });
  return Result.error("RandomError");
}

const $result = bar();
if ($result.error?.type === "ParseError") {
  console.log($result.error.meta) // { line: 10, column: 12 }
}
```

Use `Result.fn` to wrap functions that ~~`throw`~~, capturing the thrown `Error`
within a `Result` object for comfortable error handling.

```ts
const parse = Result.fn(JSON.parse);

const input = "*&!^@#*%$"
const $result = parse(input);
// $result.error.type = { thrown: SyntaxError("Unexpected token * ...") }

if ($result.error?.type.thrown instanceof SyntaxError) {
  return Result.error("InputParseFailed", { $cause: $result, input });
}
```

Use `Result.try` for one-off executions, intended to be a convenient replacement
for `try-catch` blocks. Equivalent to `Result.fn(() => { ... })()`, note the
immediate invocation with `()`.

```ts
const input = "*&!^@#*%$"
const $result = Result.try(() => JSON.parse())
```

## About

`esresult` supports:

- **intellisense** of a `Result`'s possible error types.
- **cause-chaining** to build domain-specific error causal-chains.
- **built-in data structure for error messages and info** for canonical error
  descriptions and/or contextual error information (e.g. data of a failing
  iteration in a loop).
- **ok result with warnings** for idiomatic handling of partial success cases
  where a valid value can be returned despite some non-critical errors.

## API

- [View Reference Docs + Examples](https://peterboyer.github.io/esresult/)
- [Example With and Without `esresult`](./EXAMPLE.md)

## Motivation

Heavily inspired by:
- [`neverthrow`](https://www.npmjs.com/package/neverthrow)
  ([npm](https://www.npmjs.com/package/neverthrow),
  [github](https://github.com/supermacro/neverthrow))
- Rust's [`Result`](https://doc.rust-lang.org/std/result/enum.Result.html) type.

## License

Copyright (C) 2022 Peter Boyer

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
