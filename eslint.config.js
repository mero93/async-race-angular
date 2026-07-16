const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginImport = require('eslint-plugin-import');
const airbnbBase = require('eslint-config-airbnb-base');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      ...airbnbBase.rules,

      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],

      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
        },
      ],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclarator[init.type="Literal"] > Literal[value=/^[A-Za-z]{2,}$/]',
          message:
            'Avoid magic strings. Declare string literals as descriptive global or class constants.',
        },
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': ['error'],
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': ['error'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],

      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'import/extensions': 'off',
      'import/no-unresolved': 'off',

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
