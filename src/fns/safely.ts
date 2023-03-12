import type { Enum } from "../enum";
import type { Result } from "../result";

export async function safely<T>(
	fn: () => T
): Promise<Result<Enum.Generic<Awaited<T>>, unknown>> {
	try {
		return { Ok: { value: await fn() } };
	} catch (error) {
		return { Err: { value: error } };
	}
}
