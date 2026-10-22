## ADDED Requirements

### Requirement: Private email-based super-administrator configuration
The server SHALL derive super-administrator identity exclusively from an optional, non-public `SUPER_ADMIN_EMAILS` configuration containing one or more comma-separated mailbox addresses. Address matching MUST trim surrounding whitespace, be case-insensitive, and deduplicate equivalent entries.

#### Scenario: Configuration is absent
- **WHEN** `SUPER_ADMIN_EMAILS` is unset or empty
- **THEN** no user receives super-administrator identity and all existing role behavior remains unchanged

#### Scenario: Configured address matches with different casing
- **WHEN** the configured list contains `Admin@Example.com` and an authenticated user email is `admin@example.com`
- **THEN** the server recognizes the user as a super-administrator

#### Scenario: Configuration contains multiple addresses
- **WHEN** `SUPER_ADMIN_EMAILS` contains multiple valid comma-separated addresses with surrounding whitespace
- **THEN** every matching authenticated user is recognized and empty entries are ignored

#### Scenario: Configuration contains an invalid non-empty address
- **WHEN** `SUPER_ADMIN_EMAILS` contains a non-empty value that is not a valid mailbox address
- **THEN** environment validation fails closed and the server does not start with a partially applied list

### Requirement: Effective administrator authorization
The server SHALL assign a matching user the existing effective `admin` role at runtime without persisting a role change or adding a new public role. All server role helpers, policy evaluation, and minimum-role middleware MUST use the effective role.

#### Scenario: Persisted non-admin address is configured
- **WHEN** an active member, viewer, or guest has an email listed in `SUPER_ADMIN_EMAILS`
- **THEN** administrator-only APIs and administrator policy checks authorize the user as an administrator
- **AND** viewer and guest restrictions do not continue to apply to that request

#### Scenario: Non-matching user authenticates
- **WHEN** a user's normalized email is not listed in `SUPER_ADMIN_EMAILS`
- **THEN** the server uses the persisted role without elevation

#### Scenario: Configured user is suspended
- **WHEN** a matching user or the user's workspace is suspended
- **THEN** authentication is rejected before super-administrator authorization is evaluated

#### Scenario: Configuration is removed
- **WHEN** an address is removed from `SUPER_ADMIN_EMAILS` and all server processes restart
- **THEN** the matching user immediately returns to the permissions of the persisted role

### Requirement: Hidden Web and API representation
The system MUST NOT expose a super-administrator enum value, boolean flag, badge, filter, management control, or public environment value. A matching user SHALL be represented using the existing `admin` role so existing administrator Web workflows remain available without revealing a distinct elevated identity.

#### Scenario: Web client loads a configured user
- **WHEN** the API presents a user whose email matches `SUPER_ADMIN_EMAILS`
- **THEN** the payload contains the existing `admin` role
- **AND** the payload contains no super-administrator-specific property

#### Scenario: User management UI is opened
- **WHEN** any administrator views member lists, role selectors, filters, or user dialogs
- **THEN** no super-administrator role or marker is available or displayed

#### Scenario: Public environment configuration is requested
- **WHEN** the Web application requests public server environment values
- **THEN** `SUPER_ADMIN_EMAILS` and its parsed addresses are absent

### Requirement: Workspace-scoped unrestricted content discovery and read access
A super-administrator SHALL be able to discover and read every collection and persisted document in the authenticated user's current workspace regardless of collection privacy, collection membership, group membership, document membership, guest access, or configured viewer permissions. The access MUST include private, draft, archived, and soft-deleted content, while permanently deleted content remains unavailable.

#### Scenario: Private collection has no membership
- **WHEN** a super-administrator lists, searches, or directly requests a private collection in the current workspace without membership
- **THEN** the collection and its document tree are returned

#### Scenario: Private document has no membership
- **WHEN** a super-administrator requests a private document in the current workspace without collection, group, or document membership
- **THEN** the document is returned with read access

#### Scenario: Non-active document is requested
- **WHEN** a super-administrator requests a draft, archived, or soft-deleted document in the current workspace
- **THEN** the document can be inspected without granting an additional restore or permanent-delete mutation

#### Scenario: Content belongs to another workspace
- **WHEN** a super-administrator requests a collection or document whose `teamId` differs from the authenticated user's workspace
- **THEN** access is denied without revealing the content

#### Scenario: Ordinary administrator lacks private membership
- **WHEN** an ordinary administrator who is not configured as a super-administrator requests a private document that existing policies deny
- **THEN** the existing denial remains unchanged

### Requirement: Unrestricted workspace download and export access
A super-administrator SHALL be able to download individual documents, document trees, and collections that the user can read through the elevated content-access requirement. Existing export formats, edition availability, attachment ownership boundaries, rate limits, and workspace isolation MUST remain enforced.

#### Scenario: Private document is downloaded
- **WHEN** a super-administrator downloads a private document without membership
- **THEN** the requested supported synchronous or asynchronous export is produced

#### Scenario: Private collection is exported
- **WHEN** a super-administrator exports a private collection without membership
- **THEN** the export contains the collection content permitted by the requested export options

#### Scenario: Export includes attachments
- **WHEN** a super-administrator requests attachments in an export
- **THEN** only attachments belonging to readable documents in the current workspace are included

#### Scenario: Unsupported export is requested
- **WHEN** a super-administrator requests a format or edition feature that is unavailable
- **THEN** the existing validation or edition error is returned

### Requirement: View operations leave no durable application record
When a super-administrator views a document, the system MUST NOT create or update a `View` row and MUST NOT emit a `views.create` event. The API SHALL preserve its successful response contract using transient response data that is not persisted.

#### Scenario: Super-administrator opens a document
- **WHEN** the Web client calls `views.create` for a readable document as a super-administrator
- **THEN** the request succeeds without inserting or incrementing a View record
- **AND** no `views.create` event is emitted

#### Scenario: View-derived features are queried
- **WHEN** recent documents, viewer lists, document insights, or view counts are queried after a super-administrator view
- **THEN** the super-administrator view does not appear or affect aggregates

#### Scenario: Ordinary user opens a document
- **WHEN** a non-super-administrator calls `views.create`
- **THEN** the existing View persistence and event behavior remains unchanged

### Requirement: Download operations leave no durable application history
The system MUST NOT emit download/export audit events or retain user-visible download/export history for a super-administrator. Operational state required for asynchronous exports MUST be marked ephemeral, hidden from normal file-operation listings, and hard-deleted after completion, failure, expiry, or abandonment.

#### Scenario: Synchronous document download completes
- **WHEN** a super-administrator downloads a document through a synchronous export path
- **THEN** the response is delivered without creating a FileOperation or download audit event

#### Scenario: Asynchronous export is created
- **WHEN** a super-administrator starts a document-tree or collection export that requires background processing
- **THEN** an owner-scoped ephemeral FileOperation coordinates the export without emitting `fileOperations.create`
- **AND** the operation is excluded from file-operation lists and audit results

#### Scenario: Asynchronous export is delivered
- **WHEN** the super-administrator polls and downloads a completed ephemeral export
- **THEN** the existing owner authorization and signed-download behavior works while the operation is valid
- **AND** the operation is hard-deleted after its delivery window expires

#### Scenario: Asynchronous export fails or is abandoned
- **WHEN** an ephemeral export fails, expires, or is never downloaded
- **THEN** cleanup hard-deletes its database row and stored file without creating an audit event

#### Scenario: Ordinary user exports content
- **WHEN** a non-super-administrator starts an export
- **THEN** existing FileOperation visibility, events, retention, and cleanup behavior remains unchanged

### Requirement: Audit suppression is limited to viewing and downloading
Super-administrator identity MUST NOT suppress authentication, security, administration, mutation, edit, revision, comment, share, or other non-view/download application events.

#### Scenario: Super-administrator modifies a document
- **WHEN** a super-administrator creates, edits, moves, archives, restores, or deletes content using an administrator-authorized action
- **THEN** the existing changeset, revision, and audit behavior is preserved

#### Scenario: Super-administrator performs an administrative action
- **WHEN** a super-administrator changes users, groups, workspace settings, integrations, or other administrator-managed resources
- **THEN** the existing security and administration events are preserved

#### Scenario: Infrastructure logging records a request
- **WHEN** a proxy, object store, database, or observability system records a super-administrator request
- **THEN** this feature does not alter or guarantee removal of that infrastructure record
