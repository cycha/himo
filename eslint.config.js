const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**',
      '**/tests/**',
      'client/**',
      // Ignore build artifacts and generated files
      '**/*.js.map',
      '**/coverage/**',
    ],
  },
  // Base configuration for all TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,
      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,
      // Disable base rule in favor of TypeScript-specific version
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      // Custom rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'max-params': ['warn', 5],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      'no-duplicate-imports': 'error',
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-useless-return': 'error',
      'prefer-const': 'error',
      yoda: 'error',
    },
  },
  // Special configuration for enum files (allow const + type pattern)
  {
    files: ['**/types/enums.ts'],
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
  // Special configuration for browser scraper files (Playwright/Puppeteer code)
  {
    files: ['bot/src/scrapers/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      // Allow browser globals in scraper code that injects JavaScript
      'no-undef': 'off',
    },
  },
  // Configuration for JavaScript config files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },
];
