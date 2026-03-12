import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
    plugins: [angular()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test-setup.ts'],
        pool: 'forks', // Forks are generally more stable for JSDOM + IndexedDB
        testTimeout: 10000,
        coverage: {
            reporter: ['text', 'lcov', 'clover', 'json'],
            reportsDirectory: './coverage'
        }
    },
});
