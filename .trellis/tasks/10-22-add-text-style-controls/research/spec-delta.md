## ADDED Requirements

### Requirement: Controlled span parsing

The editor SHALL parse only the supported text color and font size subset from inline `<span>` markup while unrestricted raw HTML remains disabled.

#### Scenario: Parse canonical text styles

- **WHEN** Markdown or HTML input contains a `<span>` with a valid `data-text-color` or `data-font-size` value
- **THEN** the editor applies the corresponding `text_color` or `font_size` Mark to the enclosed text

#### Scenario: Parse two styles from one span

- **WHEN** a supported `<span>` contains both a valid text color and a valid font size
- **THEN** the editor applies both independent Marks to the enclosed text

#### Scenario: Ignore unsupported styling safely

- **WHEN** a `<span>` contains an invalid color, an unsupported font size, an event attribute, or any non-whitelisted CSS declaration
- **THEN** the editor does not create a Mark from the unsupported value and preserves the visible enclosed text

#### Scenario: Keep arbitrary HTML disabled

- **WHEN** Markdown input contains an HTML element or attribute outside the controlled text-style subset
- **THEN** the Markdown parser does not enable or execute that arbitrary HTML

### Requirement: Text color formatting

The editor SHALL provide a text-selection toolbar control that sets or clears a validated, opaque text color for the editable selection.

#### Scenario: Apply a preset color

- **WHEN** a user selects editable text and chooses a preset text color
- **THEN** the entire applicable selection receives a `text_color` Mark with the canonical six-digit hexadecimal value

#### Scenario: Apply a custom color

- **WHEN** a user chooses a valid custom color with no alpha channel
- **THEN** the editor normalizes the value to a canonical six-digit hexadecimal color and applies it to the selection

#### Scenario: Reset text color

- **WHEN** a user chooses the default text color action
- **THEN** the editor removes only the `text_color` Mark and preserves all other formatting

#### Scenario: Normalize a mixed color selection

- **WHEN** a selection contains multiple text colors or includes uncolored text and the user chooses a color
- **THEN** all applicable text in the selection is set to the chosen color

### Requirement: Font size formatting

The editor SHALL provide a text-selection toolbar control that sets or clears a validated integer font size expressed in pixels.

#### Scenario: Apply a numeric font size

- **WHEN** a user selects editable text and enters an integer from `8` through `96`
- **THEN** the entire applicable selection receives a `font_size` Mark containing that numeric value and renders it in `px`

#### Scenario: Reset font size

- **WHEN** a user clears the font size or chooses the default font size action
- **THEN** the editor removes only the `font_size` Mark and preserves all other formatting

#### Scenario: Normalize a mixed font size selection

- **WHEN** a selection contains multiple font sizes or includes inherited default-sized text and the user enters a valid number
- **THEN** all applicable text in the selection is set to the entered pixel size

#### Scenario: Reject invalid numeric input

- **WHEN** a user enters a decimal, a non-numeric value, or a number outside `8` through `96`
- **THEN** the editor reports or retains an invalid input state and does not modify the document

#### Scenario: Reject unsupported imported sizes

- **WHEN** imported content supplies a non-`px` font size, a non-integer value, or a value outside `8` through `96`
- **THEN** the editor ignores that font size and does not preserve the unsupported CSS length

### Requirement: Formatting composition and context

Text color and font size SHALL compose independently with supported rich-text Marks and SHALL not be applicable to code content or unsupported selections.

#### Scenario: Compose color and size

- **WHEN** text already has a text color and the user applies a font size, or vice versa
- **THEN** both Marks remain present with their independently selected values

#### Scenario: Preserve semantic formatting

- **WHEN** text with bold, emphasis, link, comment, or highlight formatting receives a text color or font size
- **THEN** the existing supported Marks are preserved

#### Scenario: Exclude code content

- **WHEN** the selection is inside inline code or a code block
- **THEN** text color and font size controls are unavailable and the corresponding Marks are not applied

#### Scenario: Respect editor and selection state

- **WHEN** the editor is read-only or the selection is an unsupported multi-cell selection
- **THEN** the controls are hidden or disabled and do not modify the document

### Requirement: Toolbar state and accessibility

The text style controls SHALL communicate the current selection state and remain operable with the existing toolbar accessibility patterns.

#### Scenario: Show a uniform value

- **WHEN** all applicable text in the selection has the same color or font size
- **THEN** the corresponding control identifies that color or displays the numeric font size value

#### Scenario: Show inherited font size

- **WHEN** the selection has no `font_size` Mark
- **THEN** the font size control displays the default or inherited state without writing a numeric Mark or assuming all block types share one default size

#### Scenario: Show a mixed value

- **WHEN** the applicable selection contains multiple values or a combination of marked and unmarked text
- **THEN** the corresponding control displays a mixed state without reporting one value as uniformly applied

#### Scenario: Operate from the keyboard

- **WHEN** a keyboard user navigates the text-selection toolbar
- **THEN** the user can open, choose from, reset, and close both controls using the existing menu interaction model and accessible labels

#### Scenario: Use the mobile toolbar

- **WHEN** a user edits a document on a supported mobile viewport
- **THEN** the same text color and font size actions are available through the existing responsive menu or drawer behavior

### Requirement: Persistence and round-trip serialization

Supported text colors and font sizes SHALL persist through document storage, collaboration, Markdown conversion, and internal rendering paths without changing their semantic values.

#### Scenario: Persist through document reload

- **WHEN** styled text is saved to the ProseMirror and Y.js document state and the document is reopened
- **THEN** the same text color and font size Marks are restored

#### Scenario: Synchronize collaborators

- **WHEN** one compatible collaborator applies or removes a text color or font size
- **THEN** other compatible collaborators receive the same Mark change through the existing real-time collaboration flow

#### Scenario: Serialize canonical span markup

- **WHEN** styled content is converted to Markdown or HTML
- **THEN** the editor emits controlled `<span>` markup containing validated `data-text-color` or numeric `data-font-size` attributes and equivalent safe hexadecimal color or pixel font-size declarations

#### Scenario: Round-trip Markdown

- **WHEN** canonical styled Markdown is serialized and parsed again
- **THEN** the resulting text content and supported Mark values are equivalent to the original document

#### Scenario: Render supported outputs

- **WHEN** a document with styled text is rendered in document, share, revision, presentation, HTML export, or PDF paths that use the rich editor schema
- **THEN** the supported text color and font size are represented consistently

### Requirement: Schema compatibility

The application SHALL treat the new text style Marks as an editor schema change requiring a new major editor version.

#### Scenario: Reject an incompatible old client

- **WHEN** a client with the previous editor major version attempts to join an editing flow governed by the version compatibility gate
- **THEN** the application rejects the incompatible editing session before unknown Marks can modify document state

#### Scenario: Open an existing document

- **WHEN** a document created before this capability is opened by the new editor version
- **THEN** the document opens without migration and retains its existing content and formatting

#### Scenario: Validate stored mark attributes

- **WHEN** ProseMirror JSON or collaboration state contains an invalid text color or font size attribute
- **THEN** the editor rejects or omits the invalid Mark rather than writing the value into raw DOM styles
