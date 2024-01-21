# Installation

```diff
- npm install esresult
+ npm install unenum
```

# Usage

## With no errors

```diff
- import Result from "esresult";
+ import { Result } from "unenum";

function fn(): Result<string> {
-  return Result("string");
+  return Result.Ok("string");
-  return Result.error();
+  return Result.Error();
}
```

## With one error

```diff
function fn(): Result<string, "NotFound"> {
-  return Result("string");
+  return Result.Ok("string");
-  return Result.error("NotFound");
+  return Result.Error("NotFound");
}
```

### ... use value, or a default value on error

```diff
- const valueOrDefault = fn().or("default");
+ const valueOrDefault = fn().value ?? "default";
```

### ... use value, or `undefined` on error

```diff
- const valueOrUndefined = fn().orUndefined();
+ const valueOrUndefined = fn().value;
```

### ... use value, or `throw` on error

```diff
+ import { is } from "unenum";

- const value = fn().orThrow();
+ const result = fn();
+ if (is(result, "Error")) {
+   throw new Error();
+ }
+ const value = result.value;
```

### ... use value, after handling error

- No chaining equivalent.

```diff
+ import { is } from "unenum";

const $ = fn();
+ if (is($, "Error")) {
+   return ...;
+ }
+ const value = $.value;
```

## With many errors

```diff
function fn(): Result<string, "NotFound" | "NotAllowed"> {
-  return Result("string");
+  return Result.Ok("string");
-  return Result.error("NotFound");
+  return Result.Error("NotFound");
-  return Result.error("NotAllowed");
+  return Result.Error("NotAllowed");
}
```

## With detailed errors

```diff
+ import { type Enum } from "unenum";

function fn(): Result<
  string,
-    | "NotFound"
-    | "NotAllowed"
-    | ["QueryFailed", { query: Record<string, unknown>; }]
+ Enum<{
+   NotFound: true
+   NotAllowed: true
+   QueryFailed: { query: Record<string, unknown> }
+ }>
> {
-  return Result("string");
+  return Result.Ok("string");
-  return Result.error("NotFound");
+  return Result.Error({ _type: "NotFound" });
-  return Result.error("NotAllowed");
+  return Result.Error({ _type: "NotAllowed" });
-  return Result.error(["QueryFailed", { query: { a: 1, b: 2 } }]);
+  return Result.Error({ _type: "QueryFailed", query: { a: 1, b: 2 } });
}
```

```diff
+ import { is } from "unenum";
const $ = fn();

- if ($.error) {
+ if (is($, "Error")) {
- if ($.error.type === "QueryFailed") {
+ if (is($.error, "QueryFailed")) {
-   $.error.meta; // { query: { a: number, b: number } }
+   $.error.query; // { a: number, b: number }
  } else {
-    $.error.meta; // undefined
+    $.error.query; // ERROR: property doesn't exist
  }
}
```

## Async functions

```diff
- async function fn(): Result.Async<string, "Error"> {
+ async function fn(): Promise<Result<string, "Error">> {
-  return Result("string");
+  return Result.Ok("string");
-  return Result.error("Error");
+  return Result.Error("Error");
}
```

```diff
+ import { is } from "unenum";
const $ = await fn();

- const value = $.or("default");
+ const value = $.value ?? "default";
- const value = $.orUndefined();
+ const value = $.value;

- if ($.error) {
+ if (is($, "Error")) {
    return ...;
}

- const [value] = $;
+ const value = $.value;
```

## Chaining errors

- No chaining equivalent.

## Wrap throwable functions (.fn)

- No wrapping equivalent.

```diff
- const parse = Result.fn(JSON.parse);
+ const parse = (...args: Parameters<typeof JSON.parse>) =>
+   Result.from(() => JSON.parse(...args));

const $ = parse(...);
      ^ // Result<unknown, unknown>
```

## Execute throwable functions (.try)

```diff
- const $ = Result.try(() => {});
+ const $ = Result.from(() => {});
        ^ // Result<void, unknown>

- const $ = Result.try(async () => {});
+ const $ = Result.from(async () => {});
-       ^ // Promise<Result<void, unknown>>
+       ^ // Result.Async<void, unknown>

- const $ = Result.try(() => JSON.stringify({}));
+ const $ = Result.from(() => JSON.stringify({}));
        ^ // Result<string, unknown>
```

# Helpers

## JSON

- No built-in equivalent.

```diff
- import { JSON } from "esresult";

- const $ = JSON.parse(...);
+ const $ = Result.from(() => JSON.parse("..."));
        ^ // Result<unknown, unknown>

- const $ = JSON.stringify(...);
+ const $ = Result.from(() => JSON.stringify({}));
        ^ // Result<string, unknown>
```

# As global definition

- No built-in equivalent.
