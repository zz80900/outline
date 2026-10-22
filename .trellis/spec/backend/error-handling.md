# Error Handling

> Error factories, middleware behavior, and API error contracts.

---

## Overview

All API errors are created through factory functions in `server/errors.ts`. They wrap `http-errors` and attach a stable machine-readable `id` plus an `isReportable` flag used by logging and Sentry.

---

## Error Factories

```ts
export function AuthorizationError(message = "Authorization error") {
  return httpErrors(403, message, {
    id: "authorization_error",
    isReportable: false,
  });
}
```

- Import from `server/errors` (for example `ValidationError`, `InvalidRequestError`, `NotFoundError`, `AuthenticationError`, `AuthorizationError`, `RateLimitExceededError`).
- Never throw a bare `new Error()` from a route or model method that is exposed through the API.
- `isReportable: true` means the error should be reported to Sentry (unexpected/internal). Client-caused errors are `false`.
- `id` is part of the public contract; do not rename existing ids.

## Throwing vs Returning

- Routes throw domain errors and let the error middleware render them.
- Model methods may throw `EmptyResultError`, `ValidationError`, or `NotFoundError`; callers should not catch-and-ignore them.
- Use `invariant()` for programmer errors (missing preconditions), not for user input validation.

## Validation

- Validate request bodies with the `validate()` middleware and schemas from `schema.ts` in the route directory.
- Validation failures are raised as `ValidationError` and surface as 400 responses.
- Authorization always happens after loading the model: `authorize(user, "read", document)` throws `AuthorizationError`.

Reference: `server/routes/api/documents/documents.ts`, `server/middlewares/validate.ts`.

## Logging Errors

- Do not log expected client errors at error level; the middleware and Sentry integration handle reporting based on `isReportable`.
- When catching an error to add context, preserve the original error (`cause` or rethrow) rather than replacing it.
- Never include secrets, tokens, or full request bodies in error messages.

## API Response Shape

- Success: `{ success: true, data: ... }`.
- Failure: the error middleware returns `{ ok: false, error: "<id>", message: "..." }` (plus status). Presenters do not craft error payloads.

## Forbidden

- Exposing stack traces or raw database errors to clients.
- Returning `null` instead of throwing when a required model is missing; use `rejectOnEmpty: true` or `NotFoundError`.
- Swallowing errors in background tasks; log with context and let the queue retry policy apply.
