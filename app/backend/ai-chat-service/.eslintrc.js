module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'consistent-return': 'off',
    'global-require': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-cond-assign': 'off',
    'no-promise-executor-return': 'off',
    'no-useless-escape': 'off',
    'max-len': 'off',
    'prefer-destructuring': 'off',
    'eol-last': ['error', 'always'],
    'linebreak-style': 'off'
  }
};
