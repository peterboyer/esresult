// enum<variants> -> { Ok: T; Err?: never } | { Ok?: never; Err: E }

type EnumX<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { [V in K]: K extends V ? VARIANTS[K] : never } & {
					[V in Exclude<keyof VARIANTS, K>]?: never;
			  }
			: never
		: never
	: never;

{
	const $ = {} as EnumX<{ Ok: string; Err: "Invalid" }>;
	if ($.Ok) {
		console.log($);
	} else {
		console.log($);
	}
}

type ResultX<OK = unknown, ERR = unknown> = EnumX<{ Ok: OK; Err: ERR }>;

{
	const $ = {} as ResultX<string, "Invalid">;
	if ($.Ok) {
		console.log($);
	} else {
		console.log($);
	}
}

// enum<variants> -> { _: "Ok", Ok: T } | { _: "Err", Err: E }

type EnumY<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { _: K } & { [V in K]: K extends V ? VARIANTS[K] : never }
			: never
		: never
	: never;

type ResultY<OK = unknown, ERR = unknown> = EnumY<{ Ok: OK; Err: ERR }>;

{
	const result = {} as ResultY<unknown, "Invalid">;
	if (result._ === "Ok") {
		console.log(result.Ok);
	} else {
		console.log(result.Err);
	}

	(): typeof result => {
		return { _: "Ok", Ok: "something" };
	};
}

// enum<variants> -> { Ok: T } | { Err: E }

type EnumZ<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { [V in K]: K extends V ? VARIANTS[K] : never }
			: never
		: never
	: never;

type ResultZ<OK = unknown, ERR = unknown> = EnumZ<{ Ok: OK; Err: ERR }>;

{
	const result = {} as ResultZ;
	if ("Ok" in result) {
		console.log(result.Ok);
	}
	if ("Err" in result) {
		console.log(result.Err);
	}
	if ("$" in result) {
		console.log(result.$);
	}

	(): ResultZ<string, "InvalidFormat"> => {
		return { Ok: "foo" };
	};
	(): ResultZ<string, "InvalidFormat"> => {
		return { Err: "InvalidFormat" };
	};
}

// enum<variants> -> { Ok: { value: T }, Err?: never } | { Ok?: never, Err: { value: E } }

type EnumO<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { [V in K]: K extends V ? { value: VARIANTS[K] } : never } & {
					[V in Exclude<keyof VARIANTS, K>]?: never;
			  }
			: never
		: never
	: never;

type ResultO<OK = unknown, ERR = unknown> = EnumO<{ Ok: OK; Err: ERR }>;

{
	const username = {} as ResultO<string, "InvalidFormat">;
	if (username.Ok) {
		console.log(username.Ok.value);
	} else {
		console.log(username.Err.value);
	}

	(): ResultO<string, "InvalidFormat"> => {
		return { Ok: { value: "foo" } };
	};
	(): ResultO<string, "InvalidFormat"> => {
		return { Err: { value: "InvalidFormat" } };
	};
}

// enum<variants> -> { Ok: { _: T }, Err?: never } | { Ok?: never, Err: { _: E } }

type EnumM<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { [V in K]: K extends V ? { _: VARIANTS[K] } : never } & {
					[V in Exclude<keyof VARIANTS, K>]?: never;
			  }
			: never
		: never
	: never;

type ResultM<OK = unknown, ERR = unknown> = EnumM<{ Ok: OK; Err: ERR }>;

{
	const username = {} as ResultM<string, "InvalidFormat">;
	if (username.Ok) {
		console.log(username.Ok._);
	} else {
		console.log(username.Err._);
	}

	(): ResultM<string, "InvalidFormat"> => {
		return { Ok: { _: "foo" } };
	};
	(): ResultM<string, "InvalidFormat"> => {
		return { Err: { _: "InvalidFormat" } };
	};
}

// enum<variants> -> { Ok: () => T, Err?: never } | { Ok?: never, Err: () => E }

type EnumL<VARIANTS extends Record<string, unknown>> = (
	keyof VARIANTS extends unknown ? keyof VARIANTS : never
) extends infer K
	? K extends unknown
		? K extends keyof VARIANTS
			? { [V in K]: K extends V ? () => VARIANTS[K] : never } & {
					[V in Exclude<keyof VARIANTS, K>]?: never;
			  }
			: never
		: never
	: never;

type ResultL<OK = unknown, ERR = unknown> = EnumL<{ Ok: OK; Err: ERR }>;

{
	const username = {} as ResultL<string, "InvalidFormat">;
	if (username.Ok) {
		console.log(username.Ok());
	} else {
		console.log(username.Err());
	}

	if (username.Err) {
		console.log(username.Err());
	} else {
		console.log(username.Ok());
	}

	(): ResultL<string, "InvalidFormat"> => {
		return { Ok: () => "foo" };
	};
	(): ResultL<string, "InvalidFormat"> => {
		return { Err: () => "InvalidFormat" };
	};
}
