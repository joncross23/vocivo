module.exports = {
  root: true,
  ignorePatterns: [
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
    'data/generated/**',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    {
      files: ['packages/**/*.test.ts', 'apps/**/*.test.ts', 'apps/**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  ],
};
