import { expectType } from "tsd";
import type { Enum } from "./enum";

{
	const result = ((): Enum => {
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
}

{
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
}
