# Logging Guidelines

> Server logging, tracing, and what to include in log context.

---

## Overview

Use the server Logger (`server/logging/Logger.ts`) and tracing helpers. Logs are category-scoped so they can be filtered by subsystem.

---

## Logger Usage

```ts
import Logger from "@server/logging/Logger";

Logger.info("task", "Expiring file operations older than …");
Logger.warn("authentication", "Failed to authenticate", { error });
Logger.error("http", err.message, { error: err });
```

- First argument is a short category (`"task"`, `"http"`, `"authentication"`, `"database"`, `"websocket"`).
- Second argument is a human-readable message.
- Pass structured details as the third argument; never interpolate secrets or tokens into the message.
- Use `info` for lifecycle events, `warn` for recoverable anomalies, `error` for failures that need investigation.

Reference: `server/queues/tasks/CleanupExpiredFileOperationsTask.ts`, `server/middlewares/authentication.ts`.

---

## Tracing

- Decorate cross-cutting async functions with `traceFunction({ spanName })` from `@server/logging/tracing`.
- Add tags with `addTags` / `getRootSpanFromRequestContext` from `@server/logging/tracer` when the trace needs request context.
- Do not create spans for trivial helpers; trace boundaries that matter in production (exports, imports, document loading).

Reference: `server/presenters/document.ts`, `server/commands/` for existing `traceFunction` usage.

---

## Reportable Errors

- `isReportable` on the error factory controls Sentry reporting. Internal/unexpected errors are reportable; validation and authorization errors are not.
- The HTTP error middleware performs the actual reporting; do not duplicate it in routes.

---

## Background Work

- Cron and queue tasks log start and completion context (counts, durations) at info level.
- Log the operation id or model id, not the full object.
- On failure, log the error with the task name and input identifiers, then rethrow so the queue can retry.

---

## Forbidden

- `console.log` / `console.error` in server code.
- Logging full request bodies, cookies, JWTs, API keys, or passwords.
- Logging on every row of a loop; aggregate counts instead.
- Silent catch blocks (`catch {}`) in tasks and processors.
