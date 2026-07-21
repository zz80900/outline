import { SettingsMode } from "./settings";
import {
  desktopify,
  getSettingsMode,
  integrationSettingsPathForMode,
  isSettingsPath,
  newTemplatePath,
  newTemplatePathForMode,
  settingsPath,
  settingsPathForMode,
  settingsPathFromLocation,
  sharedModelPath,
} from "./routeHelpers";

describe("#settingsPath", () => {
  it("returns simplified settings paths by default", () => {
    expect(settingsPath()).toBe("/settings");
    expect(settingsPath("groups", "group-id", "members")).toBe(
      "/settings/groups/group-id/members"
    );
    expect(newTemplatePath("collection-id")).toBe(
      "/settings/templates/new?collectionId=collection-id"
    );
  });

  it("returns complete settings paths for complete mode", () => {
    expect(settingsPathForMode(SettingsMode.Complete)).toBe("/settings2");
    expect(
      settingsPathForMode(SettingsMode.Complete, "groups", "group-id")
    ).toBe("/settings2/groups/group-id");
    expect(
      integrationSettingsPathForMode(SettingsMode.Complete, "embeds")
    ).toBe("/settings2/integrations/embeds");
    expect(newTemplatePathForMode(SettingsMode.Complete, "collection-id")).toBe(
      "/settings2/templates/new?collectionId=collection-id"
    );
  });

  it("preserves the settings namespace from a location", () => {
    expect(settingsPathFromLocation("/settings2/details", "templates")).toBe(
      "/settings2/templates"
    );
    expect(
      settingsPathFromLocation(
        "/settings2/groups",
        "groups",
        "group-id",
        "members"
      )
    ).toBe("/settings2/groups/group-id/members");
    expect(
      settingsPathFromLocation(
        "/settings2/applications",
        "applications",
        "client-id"
      )
    ).toBe("/settings2/applications/client-id");
    expect(
      settingsPathFromLocation(
        "/settings2/integrations",
        "integrations",
        "embeds"
      )
    ).toBe("/settings2/integrations/embeds");
    expect(settingsPathFromLocation("/home", "templates")).toBe(
      "/settings/templates"
    );
  });
});

describe("#getSettingsMode", () => {
  it("detects supported settings namespaces", () => {
    expect(getSettingsMode("/settings")).toBe(SettingsMode.Simplified);
    expect(getSettingsMode("/settings/preferences")).toBe(
      SettingsMode.Simplified
    );
    expect(getSettingsMode("/settings2")).toBe(SettingsMode.Complete);
    expect(getSettingsMode("/settings2/details")).toBe(SettingsMode.Complete);
  });

  it("does not match unrelated settings prefixes", () => {
    expect(getSettingsMode("/settings-old/details")).toBeUndefined();
    expect(getSettingsMode("/settings20/details")).toBeUndefined();
    expect(isSettingsPath("/settings-old/details")).toBe(false);
    expect(isSettingsPath("/settings2/details")).toBe(true);
  });
});

describe("#sharedDocumentPath", () => {
  it("should return share path for a document", () => {
    const shareId = "1c922644-40d8-41fe-98f9-df2b67239d45";
    const docPath = "/doc/test-DjDlkBi77t";
    expect(sharedModelPath(shareId)).toBe(
      "/s/1c922644-40d8-41fe-98f9-df2b67239d45"
    );
    expect(sharedModelPath(shareId, docPath)).toBe(
      "/s/1c922644-40d8-41fe-98f9-df2b67239d45/doc/test-DjDlkBi77t"
    );
  });
});

describe("#desktopify", () => {
  it("should replace https protocol with outline://", () => {
    expect(
      desktopify("/doc/test-DjDlkBi77t", "https://app.getoutline.com")
    ).toBe("outline://app.getoutline.com/doc/test-DjDlkBi77t");
  });

  it("should replace http protocol with outline://", () => {
    expect(desktopify("/doc/test-DjDlkBi77t", "http://localhost:3000")).toBe(
      "outline://localhost:3000/doc/test-DjDlkBi77t"
    );
  });
});
