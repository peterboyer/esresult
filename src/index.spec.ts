import { expectType } from "tsd";
import type { Enum, Result, Future } from "./index";

describe("Enum", () => {
	it("should support an enum of one", () => {
		const result = ((): Enum<{ A: string }> => {
			return { A: { value: "a" } };
		})();
		if (result.A) {
			expectType<string>(result.A.value);
		} else {
			expectType<never>(result.A);
		}
	});

	it("should support an enum of many", () => {
		const result = ((): Enum<{ A: string; B: number }> => {
			if (Math.random()) {
				return { A: { value: "a" } };
			}
			return { B: { value: 1 } };
		})();
		if (result.A) {
			expectType<string>(result.A.value);
		} else {
			expectType<number>(result.B.value);
		}
	});

	it("should support an enum with possible undefined", () => {
		const result = ((): Enum<{ A: string; B: number | undefined }> => {
			if (Math.random()) {
				return { A: { value: "a" } };
			}
			return { B: { value: 1 } };
		})();
		if (result.A) {
			expectType<string>(result.A.value);
		} else {
			expectType<number | undefined>(result.B.value);
		}
	});

	it("should support an unknown generic variable type", () => {
		const result = (<T>(
			value: T
		): Enum<{ A: Enum.Generic<T>; B: undefined }> => {
			if (value) {
				return { A: { value } };
			}
			return { B: true };
		})(Math.random());
		if (result.A) {
			expectType<number>(result.A.value);
		} else {
			expectType<true>(result.B);
		}
	});

	describe("Infer", () => {
		it("should extract value of non-undefined variant value", () => {
			expectType<string>({} as Enum.Infer<Future<string>, "Ready">);
		});

		it("should give undefined of undefined variant value", () => {
			expectType<undefined>(undefined as Enum.Infer<Future<string>, "Pending">);
		});
	});
});

describe("Result", () => {
	it("should support unknown values", () => {
		const result = ((): Result => {
			if (Math.random()) {
				return { Err: { value: "FooError" } };
			}
			return { Ok: { value: "foo" } };
		})();
		if (result.Ok) {
			expectType<unknown>(result.Ok.value);
		} else {
			expectType<unknown>(result.Err.value);
		}
	});

	it("should support specified values", () => {
		const result = ((): Result<string, "FooError"> => {
			if (Math.random()) {
				return { Err: { value: "FooError" } };
			}
			return { Ok: { value: "foo" } };
		})();
		if (result.Ok) {
			expectType<string>(result.Ok.value);
		} else {
			expectType<"FooError">(result.Err.value);
		}
	});

	it("should support picking a single variant", () => {
		const result = ((): Pick<Result<string, "FooError">, "Err"> | undefined => {
			if (Math.random()) {
				return { Err: { value: "FooError" } };
			}
			return;
		})();
		if (result) {
			if (result.Err) {
				expectType<string>(result.Err.value);
			}
		} else {
			expectType<undefined>(result);
		}
	});
});

describe("Future", () => {
	it("should support unknown values", () => {
		const result = ((): Result => {
			if (Math.random()) {
				return { Err: { value: "FooError" } };
			}
			return { Ok: { value: "foo" } };
		})();
		if (result.Ok) {
			expectType<unknown>(result.Ok.value);
		} else {
			expectType<unknown>(result.Err.value);
		}
	});

	it("should support specified values", () => {
		const result = ((): Future<string> => {
			if (Math.random()) {
				return { Pending: true };
			}
			return { Ready: { value: "foo" } };
		})();
		if (result.Pending) {
			expectType<true>(result.Pending);
		} else {
			expectType<string>(result.Ready.value);
		}
	});
});
