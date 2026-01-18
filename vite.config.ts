import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    base: './',
    build: {
        target: 'es2020',
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@scenes': fileURLToPath(new URL('./src/scenes', import.meta.url)),
            '@systems': fileURLToPath(new URL('./src/systems', import.meta.url)),
            '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
            '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
            '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
            '@types': fileURLToPath(new URL('./src/types', import.meta.url))
        }
    },
    server: {
        port: 3000,
        host: true
    }
});
