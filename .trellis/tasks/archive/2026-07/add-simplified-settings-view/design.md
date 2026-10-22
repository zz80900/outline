## Context

Outline currently builds settings routes, sidebar entries, command-bar actions, and plugin settings from a single `useSettingsConfig` result whose paths are rooted at `/settings`. The authenticated layout detects settings with a broad `/settings` prefix check, while several settings scenes and models construct nested links directly with `settingsPath`.

The change introduces two presentation modes over the same settings scenes. The default `/settings/**` mode presents a reduced navigation surface, while `/settings2/**` presents the complete existing settings surface. The alternate namespace is a UI organization mechanism only; existing policies and API authorization remain authoritative.

The current AI settings scene combines workspace-level MCP administration with general AI options. Authenticated users need a separate connection-information page when administrators enable MCP, without receiving workspace update controls.

## Goals / Non-Goals

**Goals:**

- Present a reduced settings menu under `/settings/**` containing all account-group items plus Groups, Templates, MCP, Shared Links, Import, and Export.
- Present the complete existing settings menu under `/settings2/**`.
- Reuse the same settings scenes and definitions across both namespaces.
- Keep navigation within the active namespace, including nested group, template, application, and integration routes.
- Expose `/settings/mcp` to authenticated users only while `TeamPreference.MCP` is enabled.
- Keep MCP enablement and workspace guidance administration in the complete AI settings page.

**Non-Goals:**

- Adding a super-administrator or restricted-administrator role.
- Treating `/settings2` as a secret or security boundary.
- Changing server policies, MCP authentication, team preferences, or API contracts.
- Duplicating existing settings scenes or maintaining separate business logic for each namespace.
- Moving the MCP service endpoint away from `/mcp`.

## Decisions

### Use stable setting identifiers and derive both navigation modes

The canonical settings definition will contain a stable identifier for each item independently of its translated label and generated path. A mode-aware configuration function will derive paths and visibility for `simplified` and `complete` modes.

The simplified mode will include every item assigned to the Account group so account plugins and future account settings remain visible automatically. Workspace entries will use an explicit identifier allowlist for Groups, Templates, MCP, Shared Links, Import, and Export. The complete mode will include every item currently allowed by existing policy checks and plugin configuration.

Filtering by stable identifiers avoids depending on translated names or matching URL strings. Maintaining separate copied arrays was rejected because the definitions would drift as settings and plugins evolve.

### Model settings URLs as explicit namespaces

Route helpers will support `/settings` and `/settings2` as explicit bases. Settings detection will match either the base path itself or a slash-delimited descendant instead of relying on a raw `startsWith("/settings")` check.

Both route trees will render shared scene components. A settings route context or equivalent mode-aware path helper will provide the active namespace to sidebar links and nested settings navigation. Existing callers outside a settings route will continue to default to `/settings`.

Redirecting `/settings2/**` back to `/settings/**` while storing mode in transient UI state was rejected because refreshes and copied URLs would lose the complete-menu state.

### Scope complete navigation to `/settings2/**`

The sidebar and settings command actions will select the complete configuration only while the current path is inside `/settings2/**`. All other locations use the simplified configuration. Clicking a complete-menu item will retain the `/settings2` namespace.

The alternate namespace does not bypass item-level `enabled` policy checks. It exposes the complete set of settings that the authenticated user is already permitted to access.

### Separate MCP administration from user connection information

The current MCP UI will be refactored into reusable presentation pieces rather than copied. The complete AI scene at `/settings2/features` will retain the MCP enable switch, endpoint details, and workspace guidance controls. The simplified `/settings/mcp` scene will expose connection instructions, the workspace endpoint, documentation, and copy behavior without the enable switch or guidance editor.

The simplified MCP configuration item and route will be enabled by `team.getPreference(TeamPreference.MCP)`. This condition is independent of `can.update`, allowing authenticated non-admin users to see the connection page after an administrator enables the service. When disabled, the menu item is absent and direct navigation resolves to the settings not-found behavior.

Keeping administrative controls on the user-facing page was rejected because saving them requires workspace update permission and would produce failed requests for ordinary users.

### Preserve existing authorization behavior

No server policy changes will be made. Page components and API endpoints continue to enforce their existing permissions. Menu filtering controls discoverability and navigation only, while `TeamPreference.MCP` controls whether the user-facing MCP route exists.

## Risks / Trade-offs

- [Nested settings links fall back to `/settings`] → Audit hard-coded `settingsPath` calls in settings scenes and provide a mode-aware helper for links that must preserve `/settings2`.
- [`/settings2` is accidentally classified as `/settings`] → Replace broad prefix matching with explicit namespace predicates and add route-helper tests.
- [Plugin settings appear in the wrong mode] → Derive account visibility from the plugin group and keep all non-account plugin settings in complete mode unless explicitly allowed.
- [Disabled MCP page remains reachable through a stale link] → Apply the MCP preference condition to route registration as well as sidebar filtering.
- [Refactoring MCP UI changes administrator behavior] → Keep `TeamPreference.MCP`, `guidanceMCP`, save handlers, endpoint construction, and existing text behavior unchanged in the complete AI scene.
- [Two route trees increase test surface] → Add focused tests around generated configuration, namespace preservation, and MCP enabled/disabled states rather than duplicating all scene tests.

## Migration Plan

1. Introduce mode-aware route helpers and settings definitions while retaining `/settings` as the default namespace.
2. Register `/settings2` routes and verify complete-menu navigation without changing existing entry points.
3. Apply the simplified filter to `/settings` and update normal settings actions to target the simplified namespace.
4. Add the conditional MCP connection scene and refactor shared MCP presentation.
5. Deploy as a frontend-compatible change with no database migration or backend rollout ordering requirement.

Rollback consists of removing the `/settings2` route tree and simplified filter, then restoring the single `/settings` configuration. No stored data requires migration.

## Open Questions

None. The agreed behavior treats every authenticated user as eligible for the MCP connection menu whenever the workspace MCP preference is enabled.
