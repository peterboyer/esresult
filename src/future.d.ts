// prettier-ignore
// https://doc.rust-lang.org/std/future/trait.Future.html
// https://doc.rust-lang.org/std/task/enum.Poll.html
type Future<T = unknown> =
	| { Ready: T }
	| { Pending: undefined };

namespace Future {
	export type Ready<T> =
	export type InferReady<T> = T extends { Ready: infer R } ? R : never;
}
