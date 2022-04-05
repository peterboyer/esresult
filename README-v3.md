<p align="center">
  <img src="https://user-images.githubusercontent.com/8391902/147464722-786db152-e32d-429a-955a-d1e12960b8fc.png" alt="esresult" />
</p>

`esresult` is a zero-dependency, TypeScript-first utility for better
error-handling patterns in your code by making domain-specific errors an
**explicit** part of a function's public API.

```ts
import Result from "esresult";
```

Annotate your function's return values with `Result` to annotate both your
success value and any domain-specific error states that you would traditionally
use ~~`throw`~~ for.

```ts
function foo(value: string): Result<string, "EmptyValue"> {
  if (!value) {
    return Result.error("EmptyValue");
  }

  return Result(value);
}
```

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
