import type { Enum } from "./enum";

// prettier-ignore
// https://doc.rust-lang.org/std/future/trait.Future.html
// https://doc.rust-lang.org/std/task/enum.Poll.html
export type Future<T = unknown> = Enum<
	| Enum.Variant<"Ready", T>
	| Enum.Variant<"Pending">
>;
