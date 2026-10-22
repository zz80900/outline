## Context

Outline persists the public user role in `UserRole`, and both server and client code assume that the enum contains only administrator, member, viewer, and guest. Most administrator authorization uses `User.isAdmin`, while role-gated API middleware compares the persisted role directly. Administrators can read collections, but private document access still depends on collection or document membership.

Document viewing currently persists a `View` row and emits a `views.create` event. Document-tree and collection exports create a `FileOperation` with contextual event tracking so that background workers and redirect endpoints can produce and deliver the archive. The elevated identity therefore affects configuration, authentication, authorization, presentation, view tracking, and export lifecycle code.

The configured identity is installation-wide, but access remains bound to the authenticated user's current workspace. A matching email does not create a user in another workspace and does not permit cross-workspace queries.

## Goals / Non-Goals

**Goals:**

- Resolve the elevated identity from a private server configuration without a database migration or new public role.
- Give a matching authenticated user the same effective authorization as an administrator.
- Additionally allow that user to discover, read, and download every persisted document and collection in the current workspace, including private, draft, archived, and soft-deleted content.
- Avoid durable application-level view and download history for elevated reads and exports.
- Keep the elevated identity indistinguishable from an ordinary administrator in API and Web presentation.
- Preserve existing behavior for every non-matching user.

**Non-Goals:**

- Cross-workspace access without an authenticated user record in the target workspace.
- Bypassing authentication, suspension, CSRF protection, rate limits, edition checks, or workspace isolation.
- Granting mutation privileges beyond those already available to an administrator.
- Suppressing edit history, revision history, security events, administrative audit events, application logs, or infrastructure access logs.
- Adding a Web management screen, role selector, badge, filter, or API field for the elevated identity.

## Decisions

### 1. Resolve the identity from private server configuration

Add an optional, non-public `SUPER_ADMIN_EMAILS` environment value containing a comma-separated list of mailbox addresses. Parse it at process startup into a normalized, deduplicated set by trimming whitespace and applying case-insensitive email comparison. A configured non-empty invalid address fails environment validation instead of silently weakening or broadening access.

Expose a computed server-only `User.isSuperAdmin` getter. It reads the normalized configuration and compares it with the current user email; it is not a Sequelize column, shared type, or serialized property. Add a server-side `effectiveRole` getter that returns the existing `admin` role for a super-administrator and otherwise returns the persisted role. Configuration changes require a server restart, matching the existing environment configuration lifecycle.

Alternatives considered:

- A persisted `isSuperAdmin` column was rejected because the requested source of truth is deployment configuration and a database flag creates an additional management and synchronization path.
- A new `UserRole.SuperAdmin` enum member was rejected because it would propagate into API schemas, shared types, client models, filters, and visible role controls.

### 2. Treat the identity as an effective administrator without trusting the client

Make the existing `isAdmin`, `isMember`, `isViewer`, and `isGuest` helpers derive from `effectiveRole`. This prevents a configured viewer or guest from simultaneously being treated as both an administrator and a restricted role. Update role-gated authentication middleware to compare the effective role so a configured super-administrator satisfies administrator minimum-role checks even when the persisted role is lower.

Present `effectiveRole` as the existing public `admin` value and never serialize `isSuperAdmin`. This keeps existing administrator Web workflows usable while making the elevated identity indistinguishable from an ordinary administrator. Authorization always uses the server-side computed identity and never relies on a role value sent by the client.

Suspension and authentication checks run before role authorization and remain authoritative. Changing the configured user's persisted role does not remove the configured elevation; removing the email from configuration and restarting the server does.

Alternative considered:

- Requiring every configured account to already have the persisted administrator role was rejected because it would make email configuration insufficient as the source of elevation.

### 3. Add narrowly scoped workspace content access

Administrator equivalence covers existing administrator actions. The only additional permissions are content discovery, read, and download/export within the current workspace.

Authorization must explicitly cover collection read and document-list access, document read, document download, collection export, and loading soft-deleted documents for read or download without granting restore or permanent-delete actions. Query and loader paths must include otherwise inaccessible private content so the user can discover it through normal list, search, info, and document-tree APIs; policy changes alone are insufficient if a query filters the rows first.

The bypass always requires matching `teamId`. Attachments are included only when they belong to a document or collection that the user may read, and existing export format, edition, and rate-limit restrictions remain in force.

### 4. Preserve the view API contract without persisting a view

For a configured super-administrator, `views.create` still authenticates the request, loads the document, and verifies workspace ownership. It then returns a transient View-shaped response without calling `View.incrementOrCreate` or `Event.createFromContext`.

This preserves the client contract and local `lastViewedAt` behavior while ensuring there is no `views` row, `views.create` event, recent-document entry, viewer insight, or notification side effect derived from a persisted view. Ordinary users continue through the existing path unchanged.

### 5. Use hidden transient file operations for asynchronous exports

Single-document synchronous exports do not create download history and continue returning content directly. Exports that require background processing still need a `FileOperation` row until the archive is ready and its signed URL can be delivered.

Mark these super-administrator operations as ephemeral in the existing JSON options rather than adding a database column. Create them without contextual event emission, exclude them from file-operation list and audit results, and hard-delete the row after its delivery window expires. Cleanup must also remove failed or abandoned ephemeral operations. Direct info and redirect access remain limited to the operation owner while the operation exists.

This transient row is operational state, not durable download history. Non-ephemeral exports retain the existing `fileOperations.create` event, listing, retention, and cleanup behavior.

Alternatives considered:

- Skipping `FileOperation` entirely was rejected because existing background export workers and redirect endpoints require a durable coordination record while work is running.
- Reusing normal file operations and only hiding audit events was rejected because the operation would remain visible as download/export history.

### 6. Keep all other audit and history behavior unchanged

Only the application records directly produced by document viewing and download/export flows are suppressed. Authentication failures, configuration errors, user and team administration, document mutations, comments, shares, revisions, and security-relevant actions continue to emit their existing events.

The feature does not promise invisibility from reverse proxies, object storage access logs, database administration, observability tooling, or infrastructure logs.

## Risks / Trade-offs

- **Configured email compromise grants broad read access** -> Recommend a dedicated account protected by the deployment's strongest SSO and MFA controls; fail closed on malformed configuration.
- **Email reuse or change transfers elevation** -> Treat the environment list as the explicit source of truth, normalize consistently, and document that operators must update configuration when account ownership changes.
- **Hidden exports may leave operational rows after failures** -> Tag every elevated asynchronous export as ephemeral, exclude it from normal lists immediately, and add deterministic cleanup for complete, failed, expired, and abandoned states.
- **A policy-only change may miss query-level filters** -> Add route and integration tests that exercise list, search, direct info, document tree, synchronous download, and asynchronous export paths against private content.
- **Presenting an effective administrator role differs from the stored role** -> Keep the distinction server-only, test role-gated middleware and presenters together, and never persist the effective role.
- **Suppressing view events affects insights and recent documents** -> This is intentional for the configured identity and must not alter aggregate behavior for other users.

## Migration Plan

1. Deploy the code with `SUPER_ADMIN_EMAILS` unset; behavior remains unchanged and no database migration runs.
2. Configure one or more dedicated email addresses and restart all server and worker processes with the same private value.
3. Verify administrator APIs, private content discovery, view suppression, and synchronous/asynchronous downloads using a dedicated account.
4. Roll back by removing `SUPER_ADMIN_EMAILS` and restarting processes. Existing ordinary records remain unaffected; ephemeral export cleanup continues until no tagged operations remain.

## Open Questions

None. The design intentionally scopes access to the authenticated user's current workspace and suppresses only application-level view and download/export history.
