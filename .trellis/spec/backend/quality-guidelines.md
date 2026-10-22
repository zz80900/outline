# Backend Quality Guidelines

> Linting, formatting, typing, tests, and review standards for `server/`, `shared/`, and `plugins/`.

---

## Toolchain

| Task | Command |
| --- | --- |
| Lint | `yarn lint` (Oxlint, type-aware) |
| Format | `yarn format` (oxfmt) |
| Type check | `yarn tsc` |
| Tests | `yarn test <path>` (Vitest) |
| Migrations | `yarn db:migrate` |
| Generate migration | `yarn sequelize migration:create --name=<name>` |

CI and the Husky pre-commit hook (`lint-staged`) enforce lint and formatting.

---

## TypeScript

- `tsconfig.json` sets `strict: false` but enables `noImplicitAny`, `strictNullChecks`, `noImplicitReturns`, `noImplicitThis`, and `useUnknownInCatchVariables`. Treat all of these as required.
- `any` is a lint error (`no-explicit-any`). Use `unknown` and narrow.
- Avoid type assertions (`as`, `!`); prefer type definitions and guards.
- Always use curly braces for `if` statements.
- Prefer `interface` over `type` for object shapes.
- Avoid `#` private fields; use `private`.

---

## Documentation and Exports

- All public/exported functions and classes need JSDoc with description, `@param`, `@returns`, and `@throws` where applicable. Start `@param`/`@returns` lowercase and end with a period.
- Put exported members at the top of the file.
- Use named exports for new components and classes.
- Follow class member order: public static variables, public static methods, public variables, public methods, protected, then private.

---

## Tests

- Colocate `*.test.ts` next to the implementation; do not create new test directories.
- Server tests share a module registry within a worker. Any test using `vi.mock` or `vi.resetModules` must start with:

```ts
// @vitest-isolate true
```

- Use factories from `@server/test/factories`; do not hand-roll models in each test.
- Cover critical paths: authorization boundaries, validation, query filtering, and lifecycle transitions.
- Policy tests use `serialize(user, model)` from `server/policies/index.ts` and assert the ability map.
- Database-backed tests require PostgreSQL running at the address in `.env.test`.

Reference: `server/policies/collection.test.ts`, `server/test/factories.ts`.

---

## Review Checklist

- Route is thin; validation, auth, and transaction middleware are present where needed.
- New mutation has a matching policy rule and tests for both allowed and denied roles.
- Multi-table writes are transactional.
- Errors use `server/errors.ts` factories.
- No `any`, no silent catches, no `console.*`.
- New behavior has collocated tests; changed public symbols passed GitNexus impact analysis.

---

## Forbidden

- Editing merged migrations.
- Business logic in route handlers that belongs on a model or command.
- Raw SQL without a comment explaining why Sequelize cannot express it.
- Adding translation strings manually; they are extracted from code.
