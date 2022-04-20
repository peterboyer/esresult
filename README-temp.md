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
