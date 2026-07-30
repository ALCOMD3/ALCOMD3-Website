import { expect, test } from "@playwright/test";
import { supportedRouteLocales } from "../../src/data/i18n.config.mjs";

test("all localized routes build and expose the three-control header", async ({ page }) => {
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

test("the homepage does not request the GitHub API from the browser", async ({ page }) => {
    const githubApiRequests = [];
    page.on("request", (request) => {
        if (request.url().startsWith("https://api.github.com/")) {
            githubApiRequests.push(request.url());
        }
    });

    await page.goto("/en-us/");

    const section = page.locator("[data-contributors-section]");
    if (await section.count() > 0) {
        await expect(section).toBeVisible();
        expect(await section.locator("[data-contributor-link]").count()).toBeGreaterThan(0);
    }
    expect(githubApiRequests).toEqual([]);
});

test("localized web fonts are preloaded before first paint", async ({ page }) => {
    for (const locale of supportedRouteLocales) {
        await page.goto(`/${locale}/`);

        const fontPreloads = await page
            .locator('link[rel="preload"][as="font"][type="font/woff2"]')
            .evaluateAll((links) => links.map((link) => link.href));
        const fontDisplays = await page.evaluate(() => (
            Array.from(document.styleSheets).flatMap((stylesheet) => {
                try {
                    return Array.from(stylesheet.cssRules);
                } catch {
                    return [];
                }
            })
                .filter((rule) => rule instanceof CSSFontFaceRule)
                .map((rule) => rule.style.fontDisplay)
                .filter(Boolean)
        ));

        expect(fontPreloads).toHaveLength(locale === "en-us" ? 3 : 6);
        expect(fontPreloads.every((href) => href.endsWith(".woff2"))).toBe(true);
        expect(fontDisplays.length).toBeGreaterThan(0);
        expect(new Set(fontDisplays)).toEqual(new Set(["swap"]));

        await page.goto(`/${locale}/mcp/`);
        const documentationFontPreloads = await page
            .locator('link[rel="preload"][as="font"][type="font/woff2"]')
            .evaluateAll((links) => links.map((link) => link.href));

        expect(documentationFontPreloads).toHaveLength(locale === "en-us" ? 6 : 9);
        expect(documentationFontPreloads.some((href) => href.includes("noto-sans-mono"))).toBe(true);
    }
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
