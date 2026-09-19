import { defineConfig } from 'vitest/config'

const config = {
  oxc: {
    target: 'es2022',
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
    useDefineForClassFields: false,
  },
  test: {
    root: './',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['json'],
      include: ['packages/**/src/**/*.ts'],
      exclude: [
        '**/examples/**',
        'packages/cli/**',
        '**/types/**',
        '**/build/**',
        '**/node_modules/**',
        'packages/test-react-app/**',
        'packages/test-utils/**',
      ],
    },
    include: ['**/__tests__/**/*.test.ts'],
    globals: false,
    environment: 'node',
    // Give slow integration tests room (max jest.setTimeout was 300000)
    testTimeout: 300_000,
    hookTimeout: 300_000,
  },
}

export default defineConfig(config)
