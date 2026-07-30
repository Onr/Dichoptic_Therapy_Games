const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['coverage/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['game.js', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
        gtag: 'readonly',
        ga: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'preserve-caught-error': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
      curly: 'error',
      'no-trailing-spaces': 'error',
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always']
    }
  },
  {
    files: ['tests/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
];
