# Add hidden super admin

> Migrated from OpenSpec change `add-hidden-super-admin` (created 2026-07-29).

## Why

Operators need a tightly scoped emergency identity that can inspect and export all knowledge in a workspace without changing collection memberships or exposing a new role in the Web application. Existing administrators cannot read every private document, and ordinary view and export flows create durable activity records.

## What Changes

- Add a server-only `SUPER_ADMIN_EMAILS` configuration containing normalized email addresses that receive the elevated identity at runtime.
- Give matching authenticated users administrator-equivalent permissions without adding a persisted role or exposing a super-admin flag through API responses.
- Allow matching users to read and download every collection and document in their current workspace regardless of collection, document, group, or guest permission configuration.
- Suppress durable view history and view audit events when a matching user reads a document.
- Suppress durable download/export history and download audit events while retaining only transient operational state required to produce and deliver an export.
- Keep all mutation, security, authentication, suspension, edit history, revision history, and non-view/download audit behavior unchanged from the administrator role.
- Keep the elevated identity invisible in the Web application: the user remains represented normally, but no super-admin role, badge, flag, filter, or management control is exposed.
- **BREAKING**: None. The capability is disabled when `SUPER_ADMIN_EMAILS` is unset or empty.

## Capabilities

### New Capabilities

- `hidden-super-admin`: Server-configured hidden super-administrator identity, administrator-equivalent authorization, unrestricted workspace document access, and narrowly scoped suppression of view/download records.

### Modified Capabilities

None.

## Impact

- Configuration: `server/env.ts` and deployment environment documentation for the private `SUPER_ADMIN_EMAILS` value.
- Authentication and users: computed server-side identity on `server/models/User.ts` and role-gated authentication middleware.
- Authorization: document and collection read/download policies, plus administrator-equivalent policy evaluation.
- Activity tracking: document view creation/events and document or collection export operation/event handling.
- API presentation: ensure the computed identity is never serialized or added to shared/frontend user types.
- Tests: configuration parsing, effective administrator permissions, private content access, view suppression, export suppression, suspension handling, and non-elevated regression coverage.
