import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';
import fs from 'fs';

// Plugin to copy extension files after build
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      // Copy manifest.json
      fs.copyFileSync(
        resolve(__dirname, 'public/manifest.json'),
        resolve(__dirname, 'dist/manifest.json')
      );

      // Copy icons if they exist
      const icons = ['icon-16.png', 'icon-48.png', 'icon-128.png'];
      icons.forEach((icon) => {
        const src = resolve(__dirname, 'public', icon);
        const dest = resolve(__dirname, 'dist', icon);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      });

      console.log('Extension files copied to dist/');
    },
  };
}

// Chrome Extension build configuration
export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/extension/content.tsx'),
        background: resolve(__dirname, 'src/extension/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        format: 'es',
      },
    },
    minify: true,
    target: 'chrome100',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
