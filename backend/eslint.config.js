module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_|^error$',
        },
      ],
    },
  },
  {
    files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/__tests__/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];