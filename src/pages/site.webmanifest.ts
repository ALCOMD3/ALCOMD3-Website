import type { APIRoute } from "astro";
import { defaultRouteLocale } from "@/data/i18n";
import { locales, siteConfig } from "@/data/site";

const defaultLocale = locales[defaultRouteLocale];
const manifest = {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: defaultLocale.description,
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: siteConfig.themeColorLight,
    theme_color: siteConfig.themeColorLight,
    icons: [
        {
            src: siteConfig.icon192Path,
            sizes: "192x192",
            type: "image/png",
        },
        {
            src: siteConfig.icon512Path,
            sizes: "512x512",
            type: "image/png",
        },
    ],
};

export const GET = (() => new Response(JSON.stringify(manifest, null, 4), {
    headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
    },
})) satisfies APIRoute;
