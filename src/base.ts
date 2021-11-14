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

  is<THIS extends Base>(this: THIS, error: THIS["_error"]): boolean {
    if (typeof error === "string") return this._error === error;
    return error === Object.getPrototypeOf(this._error);
  }

  or<THIS extends Base>(
    this: THIS,
    defaultValue: THIS["_value"]
  ): THIS["_value"] {
    return this._value ?? defaultValue;
  }

  orUndefined<THIS extends Base>(this: THIS): THIS["_value"] | undefined {
    return this._value ?? undefined;
  }
}
