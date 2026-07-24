import assert from "node:assert/strict";
import { test } from "node:test";
import { themeRoleValues, themeSeedColor } from "../../src/data/theme.mjs";

test("the Material theme is generated from the configured source color", () => {
    assert.equal(themeSeedColor, "#6cb6ff");
    assert.match(themeRoleValues.light.primary, /^#[0-9a-f]{6}$/i);
    assert.match(themeRoleValues.dark.primary, /^#[0-9a-f]{6}$/i);
    assert.notEqual(themeRoleValues.light.surface, themeRoleValues.dark.surface);
    assert.notEqual(themeRoleValues.light.onSurface, themeRoleValues.dark.onSurface);
});
