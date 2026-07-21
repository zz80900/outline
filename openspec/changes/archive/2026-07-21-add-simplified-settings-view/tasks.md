## 1. Settings Configuration Foundation

- [x] 1.1 Add stable setting identifiers and explicit simplified/complete settings mode types to the canonical settings configuration.
- [x] 1.2 Extend settings and integration route helpers to generate `/settings/**` and `/settings2/**` paths without changing the default `/settings` behavior for existing callers.
- [x] 1.3 Add exact namespace detection helpers that distinguish `/settings`, `/settings2`, and unrelated prefix matches.
- [x] 1.4 Refactor `useSettingsConfig` to derive the simplified allowlist and complete configuration from one shared definition, including account-group plugin handling and existing policy checks.

## 2. Dual Settings Routing and Navigation

- [x] 2.1 Register shared top-level settings scenes under both `/settings/**` and `/settings2/**` route trees.
- [x] 2.2 Register group-member, template, application, and integration child routes for both namespaces using shared components.
- [x] 2.3 Update the authenticated layout and settings sidebar to select simplified or complete navigation from the active explicit namespace.
- [x] 2.4 Update settings command actions and normal settings entry points so complete items are only presented while visiting `/settings2/**`.
- [x] 2.5 Introduce a mode-aware settings path context or helper and migrate nested settings links, breadcrumbs, redirects, and return actions that must preserve `/settings2`.

## 3. MCP Connection Settings

- [x] 3.1 Extract reusable MCP endpoint, documentation, and copy-to-clipboard presentation from the existing AI settings scene.
- [x] 3.2 Keep the MCP enable switch and workspace guidance editor in the complete AI scene at `/settings2/features` with existing save behavior.
- [x] 3.3 Add a read-only MCP connection scene at `/settings/mcp` without the enable switch or workspace guidance editor.
- [x] 3.4 Add the MCP item to simplified settings only when `TeamPreference.MCP` is enabled, independently of workspace update permission.
- [x] 3.5 Apply the MCP preference condition to `/settings/mcp` route availability so stale direct links use settings not-found or fallback behavior when disabled.

## 4. Verification

- [x] 4.1 Add route-helper tests for both namespaces, exact namespace detection, nested paths, and default-path compatibility.
- [x] 4.2 Add settings-configuration tests covering the simplified allowlist, full `/settings2` menu, account plugins, existing policy filtering, and MCP enabled/disabled states.
- [x] 4.3 Add focused scene or routing tests proving ordinary authenticated users can view and copy MCP connection information but cannot see administration controls.
- [x] 4.4 Add navigation tests confirming sidebar and nested settings interactions remain in the active namespace.
- [x] 4.5 Run the affected Vitest files, TypeScript checks, formatting, and linting for all changed frontend files.
- [x] 4.6 Add Shared Links to the simplified settings allowlist and verify policy-aware filtering.
