import type { Result } from "./result";

{
	const result = ((): Result => {
		if (Math.random()) {
			return { Err: { _: "FooError" } };
		}
		return { Ok: { _: "foo" } };
	})();

	if (result.Ok) {
		console.log(result.Ok._);
	} else {
		console.log(result.Err._);
	}
}

{
	const result = ((): Result<string, "FooError"> => {
		if (Math.random()) {
			return { Err: { _: "FooError" } };
		}
		return { Ok: { _: "foo" } };
	})();

	result.Ok;
}
