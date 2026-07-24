import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { themeRoleValues, themeSeedColor } from "../src/data/theme.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../src/generated/theme.css");

function toKebabCase(value) {
    return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

function createColorTokens(roleValues) {
    return Object.entries(roleValues)
        .map(([role, color]) => `    --md-sys-color-${toKebabCase(role)}: ${color};`)
        .join("\n");
}

const stylesheet = `/* Generated from ${themeSeedColor} with Material Color Utilities SchemeVibrant. */
:root {
${createColorTokens(themeRoleValues.light)}
}

:root[data-theme-mode="dark"] {
${createColorTokens(themeRoleValues.dark)}
}
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, stylesheet, "utf8");
