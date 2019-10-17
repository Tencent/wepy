const acorn = require('acorn-dynamic-import').default;

const ECMA_VERSION = 2017;

const POSSIBLE_AST_OPTIONS = [
  {
    ranges: true,
    locations: true,
    ecmaVersion: ECMA_VERSION,
    sourceType: 'module',
    plugins: {
      dynamicImport: true
    }
  },
  {
    ranges: true,
    locations: true,
    ecmaVersion: ECMA_VERSION,
    sourceType: 'script',
    plugins: {
      dynamicImport: true
    }
  }
];

exports = module.exports = function ast(source) {
  let ast;
  const comments = [];
  for (let i = 0, len = POSSIBLE_AST_OPTIONS.length; i < len; i++) {
    if (!ast) {
      try {
        comments.length = 0;
        POSSIBLE_AST_OPTIONS[i].onComment = comments;
        ast = acorn.parse(source, POSSIBLE_AST_OPTIONS[i]);
      } catch (e) {
        // ignore the error
      }
    }
  }

  if (!ast) {
    ast = acorn.parse(source, {
      ranges: true,
      locations: true,
      ecmaVersion: ECMA_VERSION,
      sourceType: 'module',
      plugins: {
        dynamicImport: true
      },
      onComment: comments
    });
  }

  if (!ast || typeof ast !== 'object') {
    throw new Error(`Source could\'t be parsed`);
  }
  return ast;
};
