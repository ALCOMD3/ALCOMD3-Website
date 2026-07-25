import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { siteConfig } from "./site.config.mjs";

const GITHUB_API_VERSION = "2026-03-10";
const GENERATED_CONTRIBUTORS_PATH = resolve(
    process.cwd(),
    ".astro/contributors.json",
);

/**
 * @typedef {object} Contributor
 * @property {string} avatarUrl
 * @property {string} name
 * @property {string} profileUrl
 */

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isHttpsUrl(value) {
    if (typeof value !== "string") {
        return false;
    }

    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * @param {unknown} value
 * @returns {Contributor | null}
 */
function normalizeContributor(value) {
    if (
        typeof value !== "object"
        || value === null
        || !("login" in value)
        || !("avatar_url" in value)
        || !("html_url" in value)
        || typeof value.login !== "string"
        || value.login.length === 0
        || !isHttpsUrl(value.avatar_url)
        || !isHttpsUrl(value.html_url)
    ) {
        return null;
    }

    return {
        avatarUrl: value.avatar_url,
        name: value.login,
        profileUrl: value.html_url,
    };
}

/**
 * @param {unknown} value
 * @returns {Contributor[]}
 */
export function normalizeContributors(value) {
    if (!Array.isArray(value)) {
        throw new Error("Contributor response is invalid");
    }

    return value
        .map(normalizeContributor)
        .filter((contributor) => contributor !== null);
}

/**
 * @param {typeof fetch} [fetcher]
 * @param {string} [githubToken]
 * @returns {Promise<Contributor[]>}
 */
export async function fetchContributors(
    fetcher = fetch,
    githubToken,
) {
    const headers = new Headers({
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    });

    if (githubToken) {
        headers.set("Authorization", `Bearer ${githubToken}`);
    }

    const response = await fetcher(siteConfig.contributorsApiUrl, { headers });

    if (!response.ok) {
        throw new Error(`Contributor request failed: ${response.status}`);
    }

    return normalizeContributors(await response.json());
}

export async function loadGeneratedContributors() {
    const data = JSON.parse(await readFile(GENERATED_CONTRIBUTORS_PATH, "utf8"));
    return normalizeContributors(data);
}
