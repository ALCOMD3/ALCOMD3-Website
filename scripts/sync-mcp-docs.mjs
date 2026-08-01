import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "..");
const alcomd3Config = JSON.parse(
    await readFile(path.join(projectRoot, "alcomd3.config.json"), "utf8"),
);
const repository = alcomd3Config.repository;
if (typeof repository !== "string" || !/^[0-9A-Za-z_.-]+\/[0-9A-Za-z_.-]+$/.test(repository)) {
    throw new Error("alcomd3.config.json repository must use OWNER/REPOSITORY format");
}
const repositoryUrl = `https://github.com/${repository}`;
const rawRepositoryUrl = new URL(`${repository}/`, "https://raw.githubusercontent.com/");
const defaultRef = "main";
const sourceArgumentIndex = process.argv.indexOf("--source");
if (sourceArgumentIndex >= 0 && !process.argv[sourceArgumentIndex + 1]) {
    throw new Error("--source requires a repository path");
}
const localSource = sourceArgumentIndex >= 0
    ? path.resolve(process.argv[sourceArgumentIndex + 1] ?? "")
    : null;

const documents = [
    { source: "docs/mcp.md", target: "src/generated/mcp/en-us.md", kind: "guide" },
    { source: "docs/mcp/mcp.zh-CN.md", target: "src/generated/mcp/zh-cn.md", kind: "guide" },
    { source: "docs/mcp/mcp.zh-TW.md", target: "src/generated/mcp/zh-tw.md", kind: "guide" },
    { source: "docs/mcp/mcp.ja.md", target: "src/generated/mcp/ja-jp.md", kind: "guide" },
    { source: "docs/mcp/tools.md", target: "src/generated/mcp/tools/en-us.md", kind: "tools" },
    { source: "docs/mcp/tools.zh-CN.md", target: "src/generated/mcp/tools/zh-cn.md", kind: "tools" },
    { source: "docs/mcp/tools.zh-TW.md", target: "src/generated/mcp/tools/zh-tw.md", kind: "tools" },
    { source: "docs/mcp/tools.ja.md", target: "src/generated/mcp/tools/ja-jp.md", kind: "tools" },
];

function stripLanguageSwitcher(markdown) {
    const lines = markdown.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n").split("\n");
    if (!lines[0]?.startsWith("# ")) {
        throw new Error("MCP source document must start with one level-one heading");
    }

    let paragraphStart = 1;
    while (lines[paragraphStart] === "") {
        paragraphStart += 1;
    }
    let paragraphEnd = paragraphStart;
    while (paragraphEnd < lines.length && lines[paragraphEnd] !== "") {
        paragraphEnd += 1;
    }

    const languageSwitcher = lines.slice(paragraphStart, paragraphEnd).join(" ");
    if (!/(?:mcp|tools)(?:\.zh-CN|\.zh-TW|\.ja)?\.md/.test(languageSwitcher)) {
        throw new Error("MCP source language switcher has an unexpected format");
    }

    return [lines[0], "", ...lines.slice(paragraphEnd + 1)].join("\n");
}

function rewriteWebsiteLinks(markdown, kind) {
    if (kind === "guide") {
        return markdown.replace(
            /\((?:mcp\/)?tools(?:\.zh-CN|\.zh-TW|\.ja)?\.md\)/g,
            "(./tools/)",
        );
    }

    return markdown.replace(
        /\((?:\.\.\/mcp\.md|mcp(?:\.zh-CN|\.zh-TW|\.ja)\.md)(#[^)]+)?\)/g,
        (_match, hash = "") => `(../${hash})`,
    );
}

async function resolveRemoteCommit() {
    const headers = {
        Accept: "application/vnd.github+json",
        "User-Agent": "ALCOMD3-Website-doc-sync",
        "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
        `https://api.github.com/repos/${repository}/commits/${defaultRef}`,
        { headers },
    );
    if (!response.ok) {
        throw new Error(`Unable to resolve ${repository}@${defaultRef}: ${response.status}`);
    }

    const payload = await response.json();
    if (typeof payload.sha !== "string" || !/^[0-9a-f]{40}$/.test(payload.sha)) {
        throw new Error("GitHub returned an invalid source commit SHA");
    }
    return payload.sha;
}

async function loadSourceDocument(sourcePath, commit) {
    if (localSource) {
        return readFile(path.join(localSource, sourcePath), "utf8");
    }

    const sourceUrl = new URL(`${commit}/${sourcePath}`, rawRepositoryUrl);
    const response = await fetch(sourceUrl, {
        headers: { "User-Agent": "ALCOMD3-Website-doc-sync" },
    });
    if (!response.ok) {
        throw new Error(`Unable to download ${sourcePath}: ${response.status}`);
    }
    return response.text();
}

const commit = localSource
    ? execFileSync("git", ["-C", localSource, "rev-parse", "HEAD"], { encoding: "utf8" }).trim()
    : await resolveRemoteCommit();

if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`Invalid source commit: ${commit}`);
}

for (const document of documents) {
    const source = await loadSourceDocument(document.source, commit);
    const generated = rewriteWebsiteLinks(stripLanguageSwitcher(source), document.kind);
    const targetPath = path.join(projectRoot, document.target);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, `${generated.trimEnd()}\n`, "utf8");
}

const provenance = {
    repository,
    ref: defaultRef,
    commit,
    sourceUrl: `${repositoryUrl}/tree/${commit}/docs`,
    documents: documents.map(({ source, target }) => ({ source, target })),
};
await writeFile(
    path.join(projectRoot, "src/generated/mcp/source.json"),
    `${JSON.stringify(provenance, null, 4)}\n`,
    "utf8",
);

console.log(`Synced MCP documentation from ${repository}@${commit}`);
