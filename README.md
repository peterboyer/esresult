# tError

[![.github/workflows/ci.yml](https://github.com/ptboyer/terror/actions/workflows/ci.yml/badge.svg)](https://github.com/ptboyer/terror/actions/workflows/ci.yml)

`terror` (typed-error) is a tiny, zero-dependency, TypeScript-compatible utility
for better error-handling patterns in your code. `terror` enforces a consistent
error-handling control-flow by "baking-in" error states as domain-valid return
values, reserving unexpectedly thrown errors to represent uncaught bugs, thus
avoiding `try`/`catch` blocks in regular use.

Returning errors (instead of throwing them) allows the caller to be aware of all
possible (expected) error states of a function, integrating typed-errors as a
statically checkable return-type for your functions' interfaces (name,
parameters, ok result, and **error results**!).

`terror` also supports:

- **matching by `type`** (allowing full intellisense of functions' possible
  error results)
- **cause-chaining** (to allow tracking domain-specific error causal-chains)
- **messages** (to allow adding human-readable detail to a given error `type`),
- **context** (to allow adding contextual data of error, e.g. failing iteration
  index/value)

Heavily inspired by [`neverthrow`](https://www.npmjs.com/package/neverthrow)
([npm](https://www.npmjs.com/package/neverthrow),
[github](https://github.com/supermacro/neverthrow)) and Rust's
[`Result`](https://doc.rust-lang.org/std/result/enum.Result.html) type.

## API

[View Docs/Examples](https://ptboyer.github.io/terror/).

```shell
$ yarn add @armix/terror
```

```typescript
import { ok, err, fromThrowable } from "@armix/terror";
```

## Overview

### ✔️ Enjoy this:

```typescript
import { ok, err } from "@armix/terror";
import { getUser } from "...";

async function foo(...) {
  // yay: function doesn't need try/catch, returns Result instead
  const $user = await getUser(...);

  // yay: handle specific conditions if needed
  // yay: intellisense for is(...) to match error types
  if ($user.is("NOT_FOUND")) return ok(undefined);

  // yay: provide a function-domain specific error + ref. of `cause`
  if (!$user.ok) return err("GET_USER_ERROR").because($user);

  // yay: handled the error, now safely use the expected value.
  const user = $user.value;

  // yay: didn't have to use let to solve closure problem
  return ok(user);
}
```

### 🗑️ Not this:

```typescript
// yuck: need to import all errors you wish to handle
import { getUser, NotFoundError } from "...";

// yuck: does every function need it's only error sub-class?
export class FooError extends Error {}

async function foo(...) {
  // yuck: need to define variable outside of try/catch closure
  let user: ReturnType<typeof getUser> | undefined;

  // yuck: all callers need to remember to wrap with try/catch
  try {
    // yuck: need to break indentation to catch potential errors
    user = await getUser(...);
  } catch (e) {
    // yuck: e is `any`, not type-safe, could be anything
    // yuck: need to import all possible error types to compare
    // yuck: need to define custom error sub-classes at all
    if (e instanceof NotFoundError) return undefined;

    // yuck: unable to chain in e, unless custom error class
    if (...) throw new FooError("Unable to get user.");

    // yuck: now foo's caller is to suffer try/catch hell
    throw e;
  }

  return user;
}
```

## Wrap Unsafe Throwables

```typescript
// yuck: throwable function
function fn(...) {
  if (...) throw new TypeError(...);
  return result;
}
```

### ✔️ Enjoy this:

```typescript
// yay: safely wrap the throwable
const safeFn = fromThrowable(fn);

const $result = safeFn(...);
if (!$result.ok) return err(...).by($result);
```

### 🗑️ Not this:

```typescript
// yuck: need to try/catch when calling
try {
  fn(...);
} catch (e) {
  throw new Error(...);
}
```

## Intellisense Support

```typescript
function foo(...) {
  if (...) return err("AAA");
  if (...) return err("BBB");
  return ok(...);
}

const $foo = foo(...);
if ($foo.is( ___ )) ...
             ^ can only be: "AAA" | "BBB"
```

## Adding Context/Message Detail

It is often very useful to store context about what specifically caused an
error, particularly if an error-chain becomes quite deep or if working with
iterable data.

```typescript
for (const a of items) {
  if (...)
    return err("BAD_FORMAT", {
      // yay: add a detailed message without sacrificing an error code/type
      message: "Item excepts a strict of only uppercase letters",
      // yay: add information about the failing iteration
      context: { a },
    })
}
```

## Fallback To Primitive/Unstructured Error

If you're unable to use `fromThrowable` to wrap a throwing function, you can
create an primitive `err` using anything for its `error` value.

```typescript
// primitive/unstructured err
const $ = err.primitive(new TypeError(...));

$.ok      // false
$.error   // TypeError
```
