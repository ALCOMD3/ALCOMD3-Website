import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    fetchContributors,
    normalizeContributors,
} from "../../src/data/contributors.mjs";

const validContributor = {
    login: "CQMHV",
    avatar_url: "https://avatars.example/cqmhv.png",
    html_url: "https://github.com/CQMHV",
};

describe("normalizeContributors", () => {
    test("normalizes valid GitHub contributors and ignores invalid entries", () => {
        assert.deepEqual(
            normalizeContributors([
                validContributor,
                {
                    login: "",
                    avatar_url: "https://avatars.example/invalid.png",
                    html_url: "https://github.com/invalid",
                },
                {
                    login: "insecure",
                    avatar_url: "http://avatars.example/insecure.png",
                    html_url: "https://github.com/insecure",
                },
            ]),
            [
                {
                    avatarUrl: validContributor.avatar_url,
                    name: validContributor.login,
                    profileUrl: validContributor.html_url,
                },
            ],
        );
    });

    test("rejects a non-array response", () => {
        assert.throws(
            () => normalizeContributors({ message: "unexpected response" }),
            /Contributor response is invalid/,
        );
    });
});

describe("fetchContributors", () => {
    test("uses the configured endpoint and current GitHub REST headers", async () => {
        let request;
        const contributors = await fetchContributors(async (input, init) => {
            request = { input, init };
            return Response.json([validContributor]);
        });

        assert.equal(
            request.input,
            "https://api.github.com/repos/ALCOMD3/ALCOMD3/contributors?per_page=100",
        );
        assert.equal(request.init.headers.get("Accept"), "application/vnd.github+json");
        assert.equal(request.init.headers.get("X-GitHub-Api-Version"), "2026-03-10");
        assert.deepEqual(contributors, [
            {
                avatarUrl: validContributor.avatar_url,
                name: validContributor.login,
                profileUrl: validContributor.html_url,
            },
        ]);
    });

    test("rejects unsuccessful GitHub responses", async () => {
        await assert.rejects(
            fetchContributors(async () => Response.json(
                { message: "rate limited" },
                { status: 429 },
            )),
            /Contributor request failed: 429/,
        );
    });
});
