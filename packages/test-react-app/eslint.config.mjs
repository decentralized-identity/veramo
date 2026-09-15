import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Headless browser tests are excluded from this script's scope (as with the
  // former .eslintrc.json ignorePatterns entry).
  { ignores: ['**/*.vite-test.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: react.configs.flat.recommended.plugins,
    rules: react.configs.flat.recommended.rules,
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      // Former .eslintrc.json set env: { node, browser }.
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Preserve the v5-era baseline (0 errors / 7 warnings): these rules were
      // warnings under @typescript-eslint v5, and v8 promotes no-explicit-any
      // to an error / drops no-non-null-assertion from recommended entirely.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
)
