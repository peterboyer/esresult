import Result from "./result";

////////////////////////////////////////////////////////////////////////////////

export const parse = Result.fn(JSON.parse);
export const stringify = Result.fn(JSON.stringify);
