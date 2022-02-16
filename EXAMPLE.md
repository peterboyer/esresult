### ✔️ Enjoy this:

```ts
import { ok, err } from "esresult";
import { getUser } from "...";

async function foo(...) {
  // yay: function doesn't need try/catch, returns Result instead
  const $user = await getUser(...);

  // yay: handle specific conditions if needed
  // yay: intellisense for is(...) to match error types
  if ($user.error === "NOT_FOUND") return ok(undefined);

  // yay: provide a function-domain specific error + ref. of `cause`
  if (!$user.ok) return err("GET_USER_ERROR").setCause($user);

  // yay: handled the error, now safely use the expected value.
  const user = $user.value;

  // yay: didn't have to use let to solve closure problem
  return ok(user);
}
```

### 🗑️ Not this:

```ts
// yuck: need to import all errors you wish to handle
import { getUser, NotFoundError } from "...";

// yuck: does every function need it's only error sub-class?
export class FooError extends Error {}

async function foo(...) {
  // yuck: need to define variable outside of try/catch closure
  let user: ReturnType<typeof getUser> | undefined;

  // yuck: all callers need to remember to wrap with try/catch
  try {
    // yuck: need to break indentation to catch potential errors
    user = await getUser(...);
  } catch (e) {
    // yuck: e is `any`, not type-safe, could be anything
    // yuck: need to import all possible error types to compare
    // yuck: need to define custom error sub-classes at all
    if (e instanceof NotFoundError) return undefined;

    // yuck: unable to chain in e, unless custom error class
    if (...) throw new FooError("Unable to get user.");

    // yuck: now foo's caller is to suffer try/catch hell
    throw e;
  }

  return user;
}
```
