import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import {
    defaultRouteLocale,
    supportedRouteLocales,
    supportedUiLocales,
} from "./src/data/i18n.config.mjs";
import { siteConfig } from "./src/data/site.config.mjs";

const sitemapLocales = Object.fromEntries(
    supportedUiLocales.map((locale) => [locale.toLowerCase(), locale]),
);
const defaultLocaleUrl = new URL(`${defaultRouteLocale}/`, `${siteConfig.url}/`).href;

export default defineConfig({
    site: siteConfig.url,
    output: "static",
    integrations: [
        sitemap({
            filter: (page) => page !== `${siteConfig.url}/`,
            i18n: {
                defaultLocale: defaultRouteLocale,
                locales: sitemapLocales,
            },
            namespaces: {
                news: false,
                image: false,
                video: false,
            },
            serialize(item) {
                const links = item.links ?? [];

                if (links.some((link) => link.lang === "x-default")) {
                    return item;
                }

                const defaultLocaleLink = links.find(
                    (link) => link.lang.toLowerCase() === defaultRouteLocale,
                );

                return {
                    ...item,
                    links: [
                        ...links,
                        {
                            lang: "x-default",
                            url: defaultLocaleLink?.url ?? defaultLocaleUrl,
                        },
                    ],
                };
            },
        }),
    ],
    i18n: {
        locales: supportedRouteLocales,
        defaultLocale: defaultRouteLocale,
        routing: {
            prefixDefaultLocale: true,
            redirectToDefaultLocale: false,
        },
    },
});
