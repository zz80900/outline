## 1. Configuration and Effective Identity

- [x] 1.1 Run GitNexus upstream impact analysis for `Environment`, `User.isAdmin`, the user role helpers, authentication middleware role checks, and `presentUser`; record any HIGH or CRITICAL warnings before editing.
- [x] 1.2 Add private `SUPER_ADMIN_EMAILS` parsing and fail-closed mailbox validation in `server/env.ts`, including normalization, deduplication, empty-value behavior, and configuration examples in the existing environment sample.
- [x] 1.3 Add documented server-only `User.isSuperAdmin` and `User.effectiveRole` getters, then make `isAdmin`, `isMember`, `isViewer`, and `isGuest` derive from the effective role without changing the persisted `role` column.
- [x] 1.4 Update role-gated authentication middleware to use the effective role while preserving authentication, API key scope, and suspension checks.
- [x] 1.5 Present the effective existing `admin` role for configured users without serializing a super-administrator field or exposing `SUPER_ADMIN_EMAILS` through public environment data.
- [x] 1.6 Add collocated tests for configuration parsing, case-insensitive matching, invalid configuration, effective role helpers, suspension, middleware role gates, presenter output, and non-matching users.

## 2. Workspace Content Authorization and Discovery

- [x] 2.1 Run GitNexus upstream impact analysis for collection/document read and download policy symbols, `documentLoader`, collection list and document-tree routes, and relevant search/query builders before editing them.
- [x] 2.2 Extend collection and document policies so super-administrators can read and download same-workspace private content without memberships while ordinary administrators and other roles retain existing behavior.
- [x] 2.3 Update collection list, search, info, document-tree, and document loader paths so query-level filtering does not hide same-workspace content from a super-administrator.
- [x] 2.4 Support read and download of draft, archived, and soft-deleted documents without granting additional restore or permanent-delete mutations.
- [x] 2.5 Preserve workspace isolation, attachment ownership checks, export format validation, edition restrictions, and rate limits on every elevated path.
- [x] 2.6 Add policy and route tests covering private collections, private documents, group/document memberships, drafts, archives, soft deletion, cross-workspace denial, unsupported exports, and ordinary-administrator regressions.

## 3. View Record Suppression

- [x] 3.1 Run GitNexus upstream impact analysis for the `views.create` route, `View.incrementOrCreate`, `presentView`, and view-derived insight/recent-document flows before editing them.
- [x] 3.2 Add a super-administrator branch to `views.create` that verifies same-workspace read access and returns a transient View-shaped response without persisting a View or emitting `views.create`.
- [x] 3.3 Ensure the transient response preserves the existing API and client store contract without adding a client-visible super-administrator condition.
- [x] 3.4 Add route and model tests proving elevated views do not affect View rows, events, recent documents, viewer lists, counts, or insights while ordinary views remain unchanged.

## 4. Ephemeral Download and Export Operations

- [x] 4.1 Run GitNexus upstream impact analysis for document export routes, `collectionExporter`, `FileOperation`, file-operation API routes, export workers, and `CleanupExpiredFileOperationsTask` before editing them.
- [x] 4.2 Extend `FileOperationOptions` with a server-controlled ephemeral marker and centralize creation of elevated asynchronous exports so document-tree and collection exports use the same no-event behavior.
- [x] 4.3 Create super-administrator asynchronous exports without contextual event emission while retaining owner-only info, polling, processing, and redirect access.
- [x] 4.4 Exclude ephemeral operations from file-operation lists, audit/event results, export counts, and other user-visible history without changing ordinary operations.
- [x] 4.5 Extend cleanup to hard-delete ephemeral database rows and stored files after completion delivery windows, failure, expiry, or abandonment without emitting delete events.
- [x] 4.6 Verify synchronous document exports create neither FileOperations nor audit events for super-administrators.
- [x] 4.7 Add tests for synchronous downloads, nested document exports, collection exports, attachments, polling, redirect ownership, list exclusion, event suppression, cleanup states, and ordinary-export regressions.

## 5. Audit Boundary and Hidden Presentation

- [x] 5.1 Audit all new super-administrator branches to ensure only view and download/export application records are suppressed.
- [x] 5.2 Add regression tests proving document mutations, revisions, comments, shares, user administration, workspace settings, integrations, authentication failures, and security events retain existing logging behavior.
- [x] 5.3 Verify no `UserRole` enum member, shared user field, API schema field, frontend model property, role selector, badge, filter, or management screen is added for super-administrator identity.

## 6. Verification

- [x] 6.1 Run the focused Vitest files for environment configuration, User model, authentication middleware, presenters, collection/document policies and routes, views, file operations, export tasks, and cleanup tasks.
- [x] 6.2 Run `yarn tsc` and `yarn lint`, then apply oxfmt only to files changed by this implementation.
- [x] 6.3 Run `openspec validate "add-hidden-super-admin" --strict` and confirm every requirement scenario has corresponding test coverage or an explicitly documented integration verification.
- [x] 6.4 Run GitNexus `detect_changes` against `main` and confirm the affected symbols and execution flows match configuration, authorization, view tracking, export lifecycle, presentation, and tests only.
