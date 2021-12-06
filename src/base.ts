export class Base<
  OK extends boolean = boolean,
  VALUE = unknown,
  ERROR = unknown
> {
  readonly ok: OK;

  constructor(ok: OK, options: { value?: VALUE; error?: ERROR }) {
    this.ok = ok;
    this._value = options.value as VALUE;
    this._error = options.error as ERROR;
  }

  /**
   * @deprecated
   */
  readonly _value: VALUE;

  /**
   * @deprecated
   */
  readonly _error: ERROR;

  /**
   * Check if Result/Base is a particular error (string or object by prototype).
   *
   * @param error If given a string, compares against `error`. If given a
   * prototype, will compare with the prototype of the `error` object.
   * @returns `true` if match.
   */
  is<THIS extends Base>(this: THIS, error: THIS["_error"]): boolean {
    if (typeof error === "string") return this._error === error;
    return error === Object.getPrototypeOf(this._error);
  }

  /**
   * Returns the Result/Base's `value` if ok, otherwise returns the given
   * `defaultValue`.
   *
   * @param defaultValue Value to use if Result is not ok. Must be of the same
   * type as the ok Result/Base's `value`.
   * @returns Result's `value` or `defaultValue` if not ok.
   */
  or<THIS extends Base>(
    this: THIS,
    defaultValue: THIS["_value"]
  ): THIS["_value"] {
    return this._value ?? defaultValue;
  }

  /**
   * Returns `undefined` if the Result/Base is not ok.
   *
   * @returns Result's `value` or `undefined`.
   */
  orUndefined<THIS extends Base>(this: THIS): THIS["_value"] | undefined {
    return this._value ?? undefined;
  }
}
