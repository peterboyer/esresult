
## `ok(VALUE)`

```typescript
const $ = ok(value);
$.ok // true
$.value // value
```

## `err(TYPE)`

```typescript
const $ = err(ERROR);
$.ok // false
$.error // ERROR
$.is(ERROR) // true
```

## `err(TYPE, options)`

```typescript
const $ = err(ERROR, { message?, context? });
$.error // ERROR
$.message // message?
$.context // context?
```

## `err(...).by(cause)`

```typescript
const $ = err(ERROR, { message?, context? }).by(cause);
$.error // ERROR
$.message // message?
$.context // context?
$.cause // cause
```

## `err.primitive(Error)`

```typescript
const $ = err(new TypeError());
$.ok // false
$.error // TypeError
$.is(TypeError.prototype) // true
$.is(SyntaxError.prototype) // false
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
if ($.is(ERROR)) // $.error = ERROR

$.ok // true
$.value // VALUE

const result = $result.value;
result // VALUE
```
