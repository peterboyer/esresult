/* eslint-disable @typescript-eslint/no-explicit-any */
import _Result from "esresult";

(globalThis as any).Result = _Result;

declare global {
  type Result<V = void, E = never> = _Result<V, E>;

  namespace Result {
    type Any = _Result.Any;
    type OrThrown<V = void> = _Result.OrThrown<V>;

    type Async<V = void, E = never> = _Result.Async<V, E>;
    namespace Async {
      type Any = _Result.Async.Any;
      type OrThrown<V = void> = _Result.Async.OrThrown<V>;
    }
    type AsyncAny = _Result.AsyncAny;
    type AsyncOrThrown<V = void> = _Result.AsyncOrThrown<V>;

    type Value<V> = _Result.Value<V>;
    namespace Value {
      type Any = _Result.Value.Any;
    }
    type ValueAny = _Result.ValueAny;

    type Error<E, V = never> = _Result.Error<E, V>;
    namespace Error {
      type Any = _Result.Error.Any;
      type Thrown<V = never> = _Result.Error.Thrown<V>;
      type ThrownType = _Result.Error.ThrownType;
    }
    type ErrorAny = _Result.ErrorAny;
    type ErrorThrown<V = never> = _Result.ErrorThrown<V>;
  }

  const Result: typeof _Result;
}
