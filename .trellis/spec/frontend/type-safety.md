# Type Safety

> TypeScript conventions for `app/`, `shared/`, and the client/server boundary.

---

## Overview

The project is TypeScript everywhere. `tsconfig.json` disables `strict` overall but enables the checks that matter most; Oxlint additionally bans `any`. Type definitions are preferred over assertions.

---

## Compiler Reality

From `tsconfig.json`:

- `strict: false`, but `alwaysStrict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noImplicitReturns: true`
- `noImplicitThis: true`
- `useUnknownInCatchVariables: true`

Treat these as mandatory. Do not add `@ts-ignore`; fix the type or use a guard.

---

## Rules

- Never use `any` (`no-explicit-any` is an error). Use `unknown` and narrow it.
- Prefer declarations over assertions. Avoid `as` and non-null `!`; if unavoidable, add a comment explaining why.
- Prefer `interface` over `type` for object shapes; use `type` for unions, mapped types, and function signatures.
- Use `import type` for type-only imports.
- Always use curly braces for `if` statements.
- Avoid `#` private fields; use `private`.

---

## Type Locations

| Type | Location |
| --- | --- |
| Shared between client and server | `shared/types/` |
| Server-only request/response schemas | `server/routes/api/<resource>/schema.ts` (zod) |
| Frontend-only view types | `app/types/` |
| Component props | Inline `Props` type/interface in the component file |
| Sequelize attributes | `InferAttributes` / `InferCreationAttributes` on the model |

---

## Import Aliases

Use configured aliases instead of deep relative paths:

```ts
import { TeamPreference } from "@shared/types";
import { FileOperation } from "@server/models";
import Document from "~/models/Document";
```

- `@server/*` → `server/*`
- `@shared/*` → `shared/*`
- `~/*` → `app/*`
- `plugins/*` → `plugins/*`

---

## Boundary Types

- API payload types shared with the client belong in `shared/types`.
- Presenters define the serialized shape; do not leak Sequelize model instances to the client.
- Frontend models type their `data` from shared types and keep optional server fields explicit.
- When adding a field to an API response, update the shared type and the presenter in the same change.

Reference: `server/presenters/document.ts`, `shared/types/index.ts`.
