<p align="center">
  <img src="https://user-images.githubusercontent.com/8391902/147464722-786db152-e32d-429a-955a-d1e12960b8fc.png" alt="esresult" />
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/esresult">NPM</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/peterboyer/esresult/issues">Issues</a>
</div>

# Table of Contents

- [What is esresult?](#what-is-esresult)
- [Installation](#installation)
- [Basic usage](#basic-usage)
  - [Result of Function](#result-of-function)
  - [Result of Async Function](#result-of-async-function)

# What is esresult?

`esresult` is a tiny, zero-dependency TypeScript-focused result/error utility.

It helps you easily represent errors as part of your functions' signatures so
that:
- you don't need to maintain [`@throws` jsdoc
  annotations](https://jsdoc.app/tags-throws.html),
- you don't need to write [`Error` subclasses
  boilerplate](https://javascript.info/custom-errors),
- you don't need to return arbitary values like `-1`
  ([Array.findIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#return_value))
  or `null`
  ([String.match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match#return_value))
  to indicate an error,
- you don't need to compromise with `let` to assign a variable from [within a
  try/catch closure](https://stackoverflow.com/a/43090730),

<!-- And has a meticulously designed lightweight `Result` interface so that you can easily:

- create a `Result` to return an "ok" value ([`Result(value)`](#result)),
- create a `Result.error` to return an "error" value
  ([`Result.error("MyError")`](#result-error)),
- optionally include fully-typed error metadata with errors
  ([`Result.error(["MyError", { foo: 1 }])`](#result-error-meta)),
- fallback to a default value in case of an error ([`.or()`](#or)),
- fallback to a `undefined` to represent an error instead
  ([`.orUndefined()`](#orundefined)),
- throw if you really want to crash on an exception ([`.orThrow()`](#orthrow)), -->

# Installation

```bash
$ npm install esresult
```

# Basic usage

Creating a simple function that returns a string and doesn't expect any errors.

```ts
import Result from "esresult";

function fn(): Result<string> {
  return Result("hello");
}

// Can access result from Result because signature has no error-cases.
const [value] = fn();
```

Creating a function that may "throw" an error.

```ts
import Result from "esresult";

function fn(s: string): Result<string, "Empty"> {
  if (!s) return Result.error("Empty");
  return Result(s);
}

// (1) Handle errors with default values.
const valueOrDefault = fn(_).or("default");
const valueOrUndefined = fn(_).orUndefined();

// (2) Or handle errors with logic, check if has `error`.
const $value = fn(_);
if ($value.error) return;
// Then access value from Result after error-case is handled.
const [value] = $value;
```

# Result

## Result of Function

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

## Install

```shell
yarn add esresult
```

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
