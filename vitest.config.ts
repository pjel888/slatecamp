import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/vitest/setup.ts'],
    include: ['tests/vitest/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: process.env.CI
      ? { junit: './test-results/vitest/junit.xml' }
      : undefined,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app/dashboard/3d-lab/_components': path.resolve(__dirname, './src/features/3d-lab/components'),
      '@/app/dashboard/3d-lab/_config/dashboard-visibility': path.resolve(__dirname, './src/features/3d-lab/config/dashboard-visibility'),
      '@/app/dashboard/3d-lab/_config/modules': path.resolve(__dirname, './src/features/3d-lab/config/modules'),
      '@/app/dashboard/3d-lab/_config/registry': path.resolve(__dirname, './src/features/3d-lab/config/registry'),
      '@/app/dashboard/3d-lab/_config/taxonomy': path.resolve(__dirname, './src/features/3d-lab/config/taxonomy'),
      '@/app/dashboard/3d-lab/_constants': path.resolve(__dirname, './src/features/3d-lab/constants'),
      '@/app/dashboard/3d-lab/_hooks': path.resolve(__dirname, './src/features/3d-lab/hooks'),
      '@/app/dashboard/3d-lab/_scenes': path.resolve(__dirname, './src/features/3d-lab/scenes'),
      '@/app/dashboard/3d-lab/_stores': path.resolve(__dirname, './src/features/3d-lab/_stores'),
      '@/app/dashboard/3d-lab/_templates': path.resolve(__dirname, './src/features/3d-lab/templates'),
      '@/app/dashboard/3d-lab/_types': path.resolve(__dirname, './src/features/3d-lab/_types'),
      '@/app/dashboard/3d-lab/_utils': path.resolve(__dirname, './src/features/3d-lab/utils'),
    },
  },
})
