
## `ok(VALUE)`

```typescript
const $ = ok(value);
$.ok // true
$.value // value
```

## `err(TYPE)`

```typescript
const $ = err(type);
$.ok // false
$.error // { type }
```

## `err(TYPE, options)`

```typescript
const $ = err(type, { message?, context? });
$.error // { type, message?, context? }
```

## `err(...).by(cause)`

```typescript
const $ = err(type, { message?, context? }).by(cause);
$.error // { type, message?, context?, cause }
```

## `fromThrowable(fn)`

```typescript
const safeJSONParse = fromThrowable(JSON.parse);
const $ = safeJSONParse("sdkjhvi712364192387fsa");
if (!$.ok) // $.error = SyntaxError: Unexpected token s in JSON at ...
```

## Example

```typescript
async function example(...) {
  if (...) return err(ERROR);
  return ok(VALUE);
}

const $result = await example(...);
if (!$.ok) // $.error = ...
if ($.is(ERROR)) // $.error = { type: ERROR }

$.ok // true
$.value // VALUE

const result = $result.value;
result // VALUE
```
