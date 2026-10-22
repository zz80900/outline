# Database Guidelines

> Sequelize ORM, migrations, and query patterns.

---

## Overview

PostgreSQL is accessed through Sequelize. Models live in `server/models/` and use legacy decorators. Migrations live in `server/migrations/` and are managed with the Sequelize CLI.

---

## Models

- One model per file in `server/models/`, class name in singular `PascalCase`.
- Register new models in `server/models/index.ts`.
- Use decorators (`@Table`, `@Column`, `@Default`, `@DefaultScope`, `@HasMany`, `@BelongsTo`) rather than manual `init` calls.
- Type attributes with `InferAttributes` / `InferCreationAttributes`.
- Always give `@Column` an explicit `DataType`; decorated class fields require `useDefineForClassFields: false` (already configured in `.swcrc`).
- Model methods are the default home for single-model business logic. Methods that need the request context accept an `APIContext` and use `createWithCtx` / `destroyWithCtx` / `updateWithCtx`.

Reference: `server/models/FileOperation.ts`, `server/models/Collection.ts`.

---

## Migrations

Generate with the CLI, never write the timestamp by hand:

```bash
yarn sequelize migration:create --name=add-field-to-table
```

- File lives in `server/migrations/<timestamp>-<kebab-description>.js`.
- Export `up(queryInterface, Sequelize)` and `down(queryInterface)`.
- Wrap multi-statement changes in `queryInterface.sequelize.transaction`.
- Use `IF NOT EXISTS` / `IF EXISTS` where supported so retries are safe.
- Create indexes concurrently for existing tables (`CREATE INDEX CONCURRENTLY`).
- Never edit a migration that has been merged; add a new one.
- Update the matching model in the same change.

Reference: `server/migrations/20261012120000-add-owner-id-to-collections.js`.

---

## Query Patterns

- Prefer model static helpers over ad-hoc `findAll` in routes.
- Scopes: the default scope often includes relations. Use `.unscoped()` deliberately when raw rows are required.
- Use `Op` operators (`Op.or`, `Op.and`, `Op.ne`, `Op.lt`) instead of string SQL.
- Raw SQL is acceptable only where Sequelize cannot express the query; use `sequelize.literal` with quoted identifiers.
- Always paginate unbounded lists (`pagination()` middleware or explicit `limit`/`offset`).
- Load models with `findByPk(id, { userId })` when membership-aware scopes are needed (for example documents and collections).

```ts
const where: WhereOptions<FileOperation> = {
  teamId: user.teamId,
  type,
  [Op.and]: [
    { [Op.or]: [{ "$collection.ownerId$": null }, { "$collection.ownerId$": user.id }] },
    FileOperation.sequelize!.literal(`"options"->>'ephemeral' IS DISTINCT FROM 'true'`),
  ],
};
```

Reference: `server/routes/api/fileOperations/fileOperations.ts`.

---

## Transactions and Side Effects

- Wrap multi-table writes in `transaction()` middleware or an explicit Sequelize transaction.
- When updating array or JSON attributes, replace the value instead of mutating it in place.
- In tests, reload the model to verify persistence instead of trusting in-memory state.
- Schedule optional background work from `afterCommit`, and make queue failures non-fatal so they cannot fail the committed operation.
- Bulk deletes that drive authorization or WebSocket processing must load affected models in the transaction and delete each with request context so downstream processors receive per-item events.

---

## Testing Database Code

- Build fixtures with factories from `@server/test/factories` (`buildTeam`, `buildUser`, `buildAdmin`, `buildCollection`, `buildDocument`, `buildPersonalCollection`).
- Tests require a running PostgreSQL instance; `.env.test` points at `127.0.0.1:5432`.
- Prefer focused model/policy tests plus route tests for query-level filtering.

Reference: `server/policies/collection.test.ts`, `server/test/factories.ts`.
