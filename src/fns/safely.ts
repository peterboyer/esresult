import type { Result } from "../result";

export async function safely<T>(
	fn: () => T
): Promise<Result<Awaited<T>, unknown>> {
	try {
		return { Ok: { _: await fn() } };
	} catch (error) {
		return { Err: { _: error } };
	}
}
