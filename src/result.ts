import type { Enum } from "./enum";

// https://doc.rust-lang.org/std/result/enum.Result.html
export type Result<OK = unknown, ERR = unknown> = Enum<
	Result.Ok<OK> | Result.Err<ERR>
>;

export namespace Result {
	export type Ok<OK> = { Ok: { _: OK } };
	export type Err<ERR> = { Err: { _: ERR } };
	export type InferOk<T> = T extends { Ok: { _: infer R } } ? R : never;
	export type InferErr<T> = T extends { Err: { _: infer R } } ? R : never;
}
