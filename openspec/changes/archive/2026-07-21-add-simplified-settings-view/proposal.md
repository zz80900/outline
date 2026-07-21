## Why

The current settings area exposes the complete workspace administration menu whenever an administrator opens settings, making common account and content-management tasks harder to find. A simplified default settings view is needed while preserving the existing complete settings experience at an alternate URL, together with a user-facing MCP connection page that appears only when administrators enable the workspace MCP server.

## What Changes

- Add a simplified settings view under `/settings/**` that displays all account-related menu items plus Groups, Templates, MCP, Shared Links, Import, and Export.
- Add a complete settings view under `/settings2/**` that reuses the existing settings pages and displays the current full menu.
- Keep settings page components shared between both URL namespaces instead of duplicating their behavior.
- Add a user-facing `/settings/mcp` page that presents MCP connection information without workspace-level administration controls.
- Display and route the simplified MCP menu only when `TeamPreference.MCP` is enabled from the complete AI settings page.
- Keep the MCP enable switch and workspace guidance controls in `/settings2/features`.
- Do not introduce a new role, permission model, backend API, or security boundary for the alternate settings namespace.

## Capabilities

### New Capabilities

- `settings-navigation-modes`: Provides simplified and complete settings navigation modes backed by shared settings page definitions and distinct URL namespaces.
- `mcp-connection-settings`: Provides an MCP connection page for authenticated users, conditionally available when the workspace MCP server is enabled by an administrator.

### Modified Capabilities

None.

## Impact

- Affects frontend settings configuration, route helpers, authenticated routing, settings sidebar rendering, and settings command navigation.
- Affects internal settings links and nested routes that must preserve the active `/settings` or `/settings2` namespace.
- Refactors the existing AI settings MCP section into reusable administration and connection-facing UI without changing the existing team preference or MCP server endpoints.
- Requires focused frontend tests for both settings namespaces, menu filtering, nested navigation, and conditional MCP availability.
