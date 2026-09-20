import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3177",
    headless: true,
  },
  webServer: {
    command: "npm run start -- -p 3177",
    port: 3177,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
