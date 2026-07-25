import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchContributors } from "../src/data/contributors.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../.astro/contributors.json");

if (process.argv.includes("--clean")) {
    await rm(outputPath, { force: true });
    process.exit();
}

let contributors = [];

try {
    contributors = await fetchContributors(fetch, process.env.GITHUB_TOKEN);
    console.log(`Fetched ${contributors.length} contributors for this build.`);
} catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`Contributors are unavailable for this build: ${message}`);
}

const serializedContributors = `${JSON.stringify(
    contributors.map((contributor) => ({
        login: contributor.name,
        avatar_url: contributor.avatarUrl,
        html_url: contributor.profileUrl,
    })),
    null,
    4,
)}\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, serializedContributors, "utf8");
