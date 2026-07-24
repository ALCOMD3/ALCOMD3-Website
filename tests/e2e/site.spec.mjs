import { expect, test } from "@playwright/test";
import { supportedRouteLocales } from "../../src/data/i18n.config.mjs";
import { siteConfig } from "../../src/data/site.config.mjs";

const contributorsApiUrl = new URL(siteConfig.contributorsApiUrl);
const contributorsPattern = `${contributorsApiUrl.origin}${contributorsApiUrl.pathname}**`;
const mockedContributors = [
    {
        login: "CQMHV",
        avatar_url: "https://avatars.example/cqmhv.png",
        html_url: "https://github.com/CQMHV",
    },
];

async function mockContributors(page, contributors = mockedContributors) {
    await page.route(contributorsPattern, (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(contributors),
    }));
    await page.route("https://avatars.example/**", (route) => route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "base64",
        ),
    }));
}

test("all localized routes build and expose the three-control header", async ({ page }) => {
    await mockContributors(page);

    for (const locale of supportedRouteLocales) {
        for (const path of ["", "download/", "mcp/"]) {
            const response = await page.goto(`/${locale}/${path}`);
            expect(response?.ok()).toBe(true);
            await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
            expect(
                await page.locator("[data-language]").evaluateAll((items) => (
                    items
                        .filter((item) => item.hasAttribute("selected"))
                        .map((item) => item.getAttribute("data-language"))
                )),
            ).toEqual([locale]);
        }
    }

    await page.goto("/en-us/");
    const header = page.locator(".app-header");
    await expect(header.locator("md-filled-tonal-icon-button")).toHaveCount(3);
    await expect(header).not.toContainText("Download");
    await expect(header).not.toContainText("MCP Docs");
});

test("theme and language controls persist explicit choices", async ({ page }) => {
    await mockContributors(page);
    await page.goto("/en-us/");

    await page.locator("#theme-menu-anchor").click();
    await page.locator('[data-theme-mode-value="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme-mode", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme_mode"))).toBe("dark");

    await page.locator("#language-menu-anchor").click();
    const languageItems = page.locator("[data-language]");
    await expect(languageItems).toHaveCount(supportedRouteLocales.length);
    await page.locator('[data-language="zh-cn"]').click();
    await expect(page).toHaveURL(/\/zh-cn\/$/);
    expect(await page.evaluate(() => localStorage.getItem("ui_locale"))).toBe("zh-CN");
});

test("contributors appear only after a valid non-empty GitHub response", async ({ page }) => {
    await mockContributors(page);
    await page.goto("/en-us/");

    const section = page.locator("[data-contributors-section]");
    await expect(section).toBeVisible();
    await expect(section.locator("[data-contributor-link]")).toHaveCount(1);
    await expect(section.locator("[data-contributor-link]")).toHaveAttribute(
        "href",
        mockedContributors[0].html_url,
    );
});

test("contributors stay hidden when GitHub returns an empty list", async ({ page }) => {
    await mockContributors(page, []);
    const responsePromise = page.waitForResponse(
        (response) => response.url() === siteConfig.contributorsApiUrl,
    );
    await page.goto("/en-us/");
    await responsePromise;

    await expect(page.locator("[data-contributors-section]")).toBeHidden();
});

test("contributors stay hidden when GitHub returns an invalid payload", async ({ page }) => {
    await page.route(contributorsPattern, (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ message: "unexpected response" }),
    }));
    const responsePromise = page.waitForResponse(
        (response) => response.url() === siteConfig.contributorsApiUrl,
    );
    await page.goto("/en-us/");
    await responsePromise;

    await expect(page.locator("[data-contributors-section]")).toBeHidden();
});

test("contributors stay hidden when GitHub rate limits the request", async ({ page }) => {
    await page.route(contributorsPattern, (route) => route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ message: "rate limited" }),
    }));
    const responsePromise = page.waitForResponse(
        (response) => response.url() === siteConfig.contributorsApiUrl,
    );
    await page.goto("/en-us/");
    await responsePromise;

    await expect(page.locator("[data-contributors-section]")).toBeHidden();
});

test("contributors stay hidden when the GitHub request fails", async ({ page }) => {
    await page.route(contributorsPattern, (route) => route.abort("failed"));
    const failedRequestPromise = page.waitForEvent(
        "requestfailed",
        (request) => request.url() === siteConfig.contributorsApiUrl,
    );
    await page.goto("/en-us/");
    await failedRequestPromise;

    await expect(page.locator("[data-contributors-section]")).toBeHidden();
});

test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("critical Material actions keep their initial fallback visible", async ({ page }) => {
        const response = await page.goto("/en-us/");
        expect(response?.ok()).toBe(true);

        const selectors = [
            "#language-menu-anchor",
            "#theme-menu-anchor",
            ".header-actions md-filled-tonal-icon-button[href]",
            ".hero-actions md-filled-button",
            ".hero-actions md-outlined-button",
            ".section-action md-filled-tonal-button",
        ];

        for (const selector of selectors) {
            const action = page.locator(selector);
            await expect(action).toBeVisible();
            expect(await action.evaluate((element) => element.matches(":defined"))).toBe(false);
        }
    });

    test("download links remain ordinary usable links", async ({ page }) => {
        const response = await page.goto("/en-us/download/");
        expect(response?.ok()).toBe(true);

        const links = page.locator("[data-download-link]");
        await expect(links.first()).toBeVisible();
        expect(await links.count()).toBeGreaterThan(0);

        for (const href of await links.evaluateAll((elements) => (
            elements.map((element) => element.getAttribute("href"))
        ))) {
            expect(href).toMatch(/^https:\/\/github\.com\/ALCOMD3\/ALCOMD3\/releases\/download\//);
        }
    });
});
