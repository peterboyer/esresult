import type { Enum } from "./enum";

// prettier-ignore
// https://doc.rust-lang.org/std/result/enum.Result.html
export type Result<OK = unknown, ERR = unknown> = Enum<
	| Enum.Variant<"Ok", OK>
	| Enum.Variant<"Err", ERR>
>;
