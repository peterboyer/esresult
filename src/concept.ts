// type ErrorType<
//   TYPE = unknown,
//   META extends Record<string, unknown> | undefined =
//     | Record<string, unknown>
//     | undefined
// > = {
//   type: TYPE;
//   meta: META;
// };

// type AnnotatedFunction<
//   FN extends (...args: any[]) => any,
//   ET extends ErrorType
// > = FN & {
//   e<E>(e: E, type: ET["type"]): e is ErrorType<typeof type>;
//   // etm: ;
// };

// const annotate = <FN extends (...args: any[]) => any, ET extends string>(
//   errortypes: ET[],
//   fn: FN
// ): AnnotatedFunction<FN, ET> => {
//   return Object.assign(fn, {
//     e: (e: unknown, type: ET) => e === type,
//     etm: errortypes,
//   });
// };

// const fn = annotate(["FooError", "BarError"], function fn() {});

// fn.etm.map((et) => et === "myerror");

// try {
//   fn();
// } catch (e) {
//   if (fn.e(e, "FooError"))
//     if (fn.e(e, "myerror")) {
//       // ? myerror throwable
//     }
//   if (fn.e(e, "myerrorx")) {
//     // ? myerrorx NOT throwable
//   }
// }

import Result, { ResultErrorTuple } from "./result";

/*
| "HelloError"
| "WorldError"
| ["OtherError", { input: string; parts: string[] }]
*/

const annotate =
  <ERROR extends string | number | boolean | object | ResultErrorTuple>() =>
  <FN extends (...args: any[]) => any>(
    constructor: (
      safe: <ERR extends Result.Error<ERROR>>(error: ERR) => ERROR
    ) => FN
  ): FN & { e: ($: unknown) => undefined | Result.Error<ERROR> } => {
    return constructor((error) => error);
  };

const myfunction = annotate<
  | "HelloError"
  | "WorldError"
  | ["OtherError", { input: string; parts: string[] }]
>()((safe) => (input: string) => {
  if (input === "hello") {
    throw safe(Result.error("HelloError"));
  }

  if (input === "world") {
    throw safe(Result.error("WorldError"));
  }

  if (input === "xxx") {
    throw safe(
      Result.error(["OtherError", { input, parts: input.split(",") }])
    );
  }

  if (input === "yyy") {
    throw safe(Result.error("BadError")) ?? safe(Result.error("OtherError"));
  }

  return input;
});

try {
  const result = myfunction("something");
} catch (e) {
  const $ = myfunction.e(e);
  const error = $?.error;
  if (error) {
    if (error.type === "HelloError") {
      const parts = error.meta?.parts;
      throw Result.error("MyFunctionHelloError", { cause: $ });
    }
    if (error.type === "OtherError") {
      const parts = error.meta?.parts;
      throw Result.error(["MyFunctionOtherError", { parts }], { cause: $ });
    }
  }
}

// const annotate = <
//   ERROR extends string | number | boolean | object | ResultErrorTuple,
//   FN extends (...args: any[]) => any = (...args: any[]) => any
// >(
//   constructor: (safe: (error: Result.Error<ERROR>) => ERROR) => FN
// ): FN => {
//   return constructor((error) => error);
// };

// const myfunction = annotate<
//   | "HelloError"
//   | "WorldError"
//   | ["OtherError", { input: string; parts: string[] }]
// >((safe) => (input: string) => {
//   if (input === "hello") {
//     throw safe(Result.error("HelloError"));
//   }

//   if (input === "world") {
//     throw safe(Result.error("WorldError"));
//   }

//   if (input === "xxx") {
//     throw safe(
//       Result.error(["OtherError", { input, parts: input.split(",") }])
//     );
//   }

//   if (input === "yyy") {
//     throw safe(Result.error("BadError")) ?? safe(Result.error("OtherError"));
//   }

//   return input;
// });

// const result = myfunction();
