# Backend Directory Structure

> How the Koa/Sequelize backend in `server/` is organized.

---

## Overview

The backend is a Koa server with an RPC-style API, Sequelize models, cancan policies, and Bull queues. Routes are thin; business logic lives on models or in commands when it spans models.

---

## Directory Layout

```text
server/
├── routes/            Koa routers
│   ├── api/           HTML/JSON API, one directory per resource
│   └── auth/          Authentication endpoints
├── commands/          Operations spanning multiple models
├── config/            Sequelize database configuration
├── emails/            Transactional email templates
├── middlewares/       Shared Koa middleware (auth, validation, transaction, pagination)
├── migrations/        Sequelize migrations (generated, never edited after merge)
├── models/            Sequelize models and model-scoped helpers
│   ├── base/          ParanoidModel, Model, IdModel, etc.
│   └── helpers/       Pure helpers tied to a model
├── onboarding/        Markdown templates for onboarding documents
├── policies/          cancan authorization rules
├── presenters/        Backend → frontend JSON shaping
├── queues/            Bull queues
│   ├── processors/    Event-bus driven jobs
│   └── tasks/         Scheduled or arbitrary async jobs
├── services/          Process entry points: web, worker, websockets, collaboration, admin
├── static/            Static assets
├── test/              Factories, fixtures, test server, setup
└── utils/             Backend-only utilities
```

---

## Where New Code Goes

| Need | Location |
| --- | --- |
| A new API endpoint | `server/routes/api/<resource>/<resource>.ts` + request schemas in `schema.ts` in the same directory |
| Route registration | Import the router in `server/routes/api/index.ts` |
| Business logic for one model | A method on the model in `server/models/<Model>.ts` |
| Logic spanning models | `server/commands/<verbNoun>.ts` |
| Authorization | `server/policies/<model>.ts` using `allow`/`deny` from `./cancan` |
| Response contract | `server/presenters/<model>.ts` |
| Cross-cutting request behavior | `server/middlewares/<name>.ts` |
| Periodic or queued work | `server/queues/tasks/` (cron/one-off) or `server/queues/processors/` (event-driven) |
| Shared server-only utility | `server/utils/` |
| Logic shared with the client | `shared/utils/` (not `server/utils/`) |

---

## Route Pattern

Routes stay thin: authenticate, validate, authorize, call a model/command, present.

```ts
router.post(
  "documents.export",
  auth(),
  validate(T.DocumentsExportSchema),
  rateLimiter(RateLimiterStrategy.TwentyFivePerMinute),
  transaction(),
  async (ctx: APIContext<T.DocumentsExportReq>) => {
    const { id } = ctx.input.body;
    const { user } = ctx.state.auth;
    const document = await Document.findByPk(id, { userId: user.id });
    authorize(user, "read", document);
    // ...
    ctx.body = { success: true, data: { fileOperation: presentFileOperation(fileOperation) } };
  }
);
```

Reference: `server/routes/api/documents/documents.ts`.

---

## Naming Conventions

- Files and directories: `camelCase` for utilities, `PascalCase` for models, presenters, commands, tasks, and middleware matching their export.
- Resource directories and route names: plural, lower-case (`collections`, `fileOperations`).
- Route names: `resource.action` (for example `documents.export`, `fileOperations.list`).
- Model classes: singular `PascalCase` (`Document`, `FileOperation`).
- Migrations: generated timestamp prefix plus kebab-case description (`20261012120000-add-owner-id-to-collections.js`).
- Tests: collocated next to the implementation with `.test.ts` suffix.

---

## Examples

- Thin route with validation and authorization: `server/routes/api/documents/documents.ts`
- Model with query helpers and lifecycle methods: `server/models/FileOperation.ts`
- Command spanning models: `server/commands/documentLoader.ts`
- Event-driven processor: `server/queues/processors/`
- Policy rules: `server/policies/document.ts`
- Presenter options pattern: `server/presenters/document.ts`
