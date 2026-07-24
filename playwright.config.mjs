import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    use: {
        baseURL: "http://127.0.0.1:4322",
        colorScheme: "light",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run dev -- --host 127.0.0.1 --port 4322",
        url: "http://127.0.0.1:4322/en-us/",
        reuseExistingServer: true,
        timeout: 120000,
    },
});
