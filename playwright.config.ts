import {defineConfig} from '@playwright/test';
const basePath=(process.env.BASE_PATH??'').replace(/\/$/,'');
const baseURL=process.env.PLAYWRIGHT_BASE_URL??`http://127.0.0.1:4207${basePath}/`;
export default defineConfig({
 testDir:'./tests/browser',fullyParallel:true,workers:2,timeout:30000,
 use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}},
 webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run preview',url:baseURL,reuseExistingServer:!process.env.CI},
});
