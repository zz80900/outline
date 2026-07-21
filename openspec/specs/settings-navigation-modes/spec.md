# Settings Navigation Modes

## Purpose

Define the simplified and complete settings namespaces, their navigation behavior, and their shared authorization boundaries.

## Requirements

### Requirement: Simplified settings navigation
The application SHALL display a simplified settings navigation for routes in the `/settings/**` namespace.

#### Scenario: Account settings remain available
- **WHEN** an authenticated user opens a route in `/settings/**`
- **THEN** the settings navigation includes every enabled item assigned to the Account group

#### Scenario: Selected workspace settings remain available
- **WHEN** an authenticated user opens a route in `/settings/**`
- **THEN** the settings navigation includes the enabled Groups, Templates, Shared Links, Import, and Export items

#### Scenario: Unselected workspace settings are hidden
- **WHEN** an authenticated user opens a route in `/settings/**`
- **THEN** the settings navigation does not display other Workspace or Integrations items from the complete settings configuration

### Requirement: Complete settings navigation
The application SHALL display the complete existing settings navigation for routes in the `/settings2/**` namespace.

#### Scenario: Administrator opens complete settings
- **WHEN** an administrator opens `/settings2/details`
- **THEN** the settings navigation displays every existing settings item enabled by the administrator's current policies and plugin configuration

#### Scenario: Complete navigation remains in its namespace
- **WHEN** a user selects a settings item while viewing `/settings2/**`
- **THEN** the destination URL remains under `/settings2/**`

### Requirement: Shared settings pages
The application SHALL render shared settings scene components in both settings namespaces without duplicating their business logic.

#### Scenario: Shared top-level page
- **WHEN** equivalent `/settings/<section>` and `/settings2/<section>` routes are registered
- **THEN** both routes render the same section scene component with navigation appropriate to their active namespace

#### Scenario: Nested settings navigation
- **WHEN** a user opens a nested group, template, application, or integration page from `/settings2/**`
- **THEN** breadcrumbs, actions, and return navigation preserve the `/settings2` namespace

### Requirement: Settings namespace detection
The application MUST distinguish `/settings/**` and `/settings2/**` as separate explicit settings namespaces.

#### Scenario: Simplified namespace detection
- **WHEN** the current path is `/settings` or begins with `/settings/`
- **THEN** the authenticated layout uses the simplified settings sidebar

#### Scenario: Complete namespace detection
- **WHEN** the current path is `/settings2` or begins with `/settings2/`
- **THEN** the authenticated layout uses the complete settings sidebar

#### Scenario: Unrelated prefix is not a settings route
- **WHEN** a path merely begins with the characters `/settings` but is not either supported namespace
- **THEN** the application does not classify it as a settings route

### Requirement: Existing authorization remains authoritative
The alternate settings namespace MUST NOT grant permissions that the authenticated user does not already possess.

#### Scenario: Complete menu respects policies
- **WHEN** a user opens `/settings2/**`
- **THEN** settings items disabled by existing policies remain unavailable
