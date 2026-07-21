# MCP Connection Settings

## Purpose

Define how authenticated users access MCP connection information while workspace administrators retain control over MCP configuration.

## Requirements

### Requirement: Conditional MCP menu availability
The application SHALL expose the simplified MCP settings menu and route according to the workspace `TeamPreference.MCP` value rather than workspace update permission.

#### Scenario: MCP is enabled
- **WHEN** an administrator has enabled the workspace MCP server
- **THEN** every authenticated user sees the MCP item in the simplified settings menu and can open `/settings/mcp`

#### Scenario: MCP is disabled
- **WHEN** the workspace MCP server is disabled
- **THEN** the simplified settings menu does not display the MCP item

#### Scenario: Disabled MCP route is opened directly
- **WHEN** an authenticated user directly opens `/settings/mcp` while the workspace MCP server is disabled
- **THEN** the application renders the settings not-found behavior or redirects to an available settings page

### Requirement: User-facing MCP connection page
The `/settings/mcp` page SHALL provide authenticated users with the information required to connect an MCP client without exposing workspace administration controls.

#### Scenario: User views connection information
- **WHEN** an authenticated user opens `/settings/mcp` while MCP is enabled
- **THEN** the page displays the workspace MCP endpoint based on the current origin, setup guidance, and documentation access

#### Scenario: User copies the endpoint
- **WHEN** the user activates the endpoint copy control
- **THEN** the application copies the MCP endpoint and confirms the action

#### Scenario: Ordinary user views the page
- **WHEN** an authenticated user without workspace update permission opens `/settings/mcp`
- **THEN** the page renders without an MCP enable switch or workspace guidance editor

### Requirement: MCP administration remains in complete AI settings
The complete AI settings page SHALL remain the workspace administration surface for MCP configuration.

#### Scenario: Administrator configures MCP
- **WHEN** an administrator opens `/settings2/features`
- **THEN** the page provides the existing MCP enable switch and workspace guidance controls

#### Scenario: Administrator disables MCP
- **WHEN** an administrator disables MCP from `/settings2/features`
- **THEN** the `/settings/mcp` menu item and route become unavailable to authenticated users

### Requirement: Existing MCP service behavior is preserved
The settings navigation change MUST NOT modify the MCP service endpoint, authentication flow, team preference storage, or workspace guidance storage.

#### Scenario: MCP endpoint remains stable
- **WHEN** MCP is enabled after this change
- **THEN** clients continue to connect through the existing `/mcp` service endpoint
