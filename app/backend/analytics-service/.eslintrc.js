module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'linebreak-style': 'off',
    'eol-last': ['error', 'always'],
    'max-len': 'off',
    'prefer-destructuring': 'off',
    'quote-props': 'off',
    'arrow-parens': 'off',
    'no-nested-ternary': 'off',
    quotes: 'off',
    'object-curly-newline': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
  },
};
