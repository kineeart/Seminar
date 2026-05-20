module.exports = {
  root: true,
  env: { node: true, jest: true, es2021: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
    camelcase: 'off',
    'global-require': 'off',
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'unicode-bom': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'padded-blocks': 'off',
    'max-len': 'off',
    'linebreak-style': 'off',
    'eol-last': ['error', 'always'],
  },
};

