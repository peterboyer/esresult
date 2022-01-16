export class Base<
  OK extends boolean = boolean,
  VALUE = unknown,
  ERROR = unknown
> {
  readonly ok: OK;
  readonly value: VALUE;
  readonly error: ERROR;

  constructor(ok: OK, options: { value?: VALUE; error?: ERROR }) {
    this.ok = ok;
    this.value = options.value as VALUE;
    this.error = options.error as ERROR;
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
    defaultValue: THIS["value"]
  ): THIS["value"] {
    return this.value ?? defaultValue;
  }

  /**
   * Returns `undefined` if the Result/Base is not ok.
   *
   * @returns Result's `value` or `undefined`.
   */
  orUndefined<THIS extends Base>(this: THIS): THIS["value"] | undefined {
    return this.value ?? undefined;
  }
}
