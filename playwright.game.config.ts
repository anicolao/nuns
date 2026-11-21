import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/multiplayer',outputDir:'test-results/multiplayer',fullyParallel:false,workers:1,timeout:180000,
 expect:{timeout:10000},use:{actionTimeout:10000,baseURL:'http://127.0.0.1:5307/',trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}},
 webServer:{command:'npx vite dev --host 127.0.0.1 --port 5307 --strictPort',url:'http://127.0.0.1:5307/',reuseExistingServer:!process.env.CI,env:{VITE_USE_FIREBASE_EMULATORS:'true',BASE_PATH:''}},
});
