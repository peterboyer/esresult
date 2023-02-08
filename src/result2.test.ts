import { expectType } from "tsd";
import { Result, orbox, safe } from "./result";

describe("Result", () => {
	it("should correctly type-narrow with a primitive", async () => {
		type ID = string;

		async function getNextId(): Promise<Result<ID, "DatabaseError">> {
			if (Math.random()) {
				return { error: "DatabaseError" };
			}
			const nextId: ID = "abc";
			return { value: nextId };
		}

		const nextId = await getNextId();

		if (nextId.error) {
			expectType<"DatabaseError">(nextId.error);
			return;
		}

		expectType<string>(nextId.value);
	});

	it("should correctly type-narrow with an object", async () => {
		type User = {
			id: string;
			name: string;
		};

		async function getUser(options: {
			id: string;
		}): Promise<Result<User, "DatabaseError" | "OptionsIdInvalid">> {
			if (!options.id) {
				return { error: "OptionsIdInvalid" };
			}
			const user: User = { id: options.id, name: "Foo McBar" };
			return user;
		}

		const user = await getUser({ id: "abc" });

		if (user.error) {
			expectType<"DatabaseError" | "OptionsIdInvalid">(user.error);
			return;
		}

		expectType<User>(user);
		expectType<string>(user.id);
		expectType<string>(user.name);
	});
});

const sym = Symbol();
const obj = {};
const arr = [] as unknown[];
const fn = (): undefined => undefined;

describe("orbox", () => {
	test.each([
		[undefined, { value: undefined }],
		[null, { value: null }],
		[true, { value: true }],
		[false, { value: false }],
		[0, { value: 0 }],
		[123, { value: 123 }],
		["", { value: "" }],
		["abc", { value: "abc" }],
		[sym, { value: sym }],
		[obj, obj],
		[arr, arr],
		[fn, fn],
	])("%s -> %s", (value, expected) => {
		expect(orbox(value)).toEqual(expected);
	});
});

describe("safe", () => {
	test.each([
		[() => undefined, { value: undefined }],
		[() => null, { value: null }],
		[() => true, { value: true }],
		[() => false, { value: false }],
		[() => 0, { value: 0 }],
		[() => 123, { value: 123 }],
		[() => "", { value: "" }],
		[() => "abc", { value: "abc" }],
		[() => sym, { value: sym }],
		[() => obj, { value: obj }],
		[() => arr, { value: arr }],
		[() => fn, { value: fn }],
		[async () => undefined, { value: undefined }],
		[async () => null, { value: null }],
		[async () => true, { value: true }],
		[async () => false, { value: false }],
		[async () => 0, { value: 0 }],
		[async () => 123, { value: 123 }],
		[async () => "", { value: "" }],
		[async () => "abc", { value: "abc" }],
		[async () => sym, { value: sym }],
		[async () => obj, { value: obj }],
		[async () => arr, { value: arr }],
		[async () => fn, { value: fn }],
	])("%s -> %s", async (fn, expected) => {
		expect(await safe(fn)).toEqual(expected);
	});

	test.each([
		[
			() => {
				throw "error";
			},
			{ error: "error" },
		],
		[
			async () => {
				throw "error";
			},
			{ error: "error" },
		],
		[
			() =>
				new Promise((_, reject) => {
					return reject("error");
				}),
			{ error: "error" },
		],
	])("%s -> %s", async (fn, expected) => {
		expect(await safe(fn)).toEqual(expected);
	});

	test("JSON.parse", () => {
		const result = safe(() => JSON.parse("{}"));
		expectType<Result<unknown>>(result);

		if (result.error) {
			expectType<unknown>(result.error);
			return;
		}

		expectType<unknown>(result.value);
	});

	test("JSON.parse value", () => {
		const result = safe(() => JSON.parse("{}"));

		expect(result).toEqual({
			value: {},
		});
	});

	test("JSON.parse error", () => {
		const result = safe(() => JSON.parse(""));

		expect(result).toEqual({
			error: new SyntaxError("Unexpected end of JSON input"),
		});
	});

	test("async JSON.parse", async () => {
		const result = await safe(async () => JSON.parse("{}"));
		expectType<Result<unknown>>(result);

		if (result.error) {
			expectType<unknown>(result.error);
			return;
		}

		expectType<unknown>(result.value);
	});
});
