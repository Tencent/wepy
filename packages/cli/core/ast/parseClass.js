const walk = require('acorn/dist/walk');
const toAST = require('./toAST');

exports = module.exports = function parseClass (source) {
  source = '(' + source + ');';
  ast = toAST(source);

  let result = [];
  walk.ancestor(ast, {
    ObjectExpression (node) {
      node.properties.forEach(p => {
        if (p.key.type === 'Literal') {
          if (p.value.type === 'Identifier') {
            result.push({
              [p.key.value]: p.value.name
            });
          } else {
            result.push({
              [p.key.value]: source.substring(p.value.start, p.value.end)
            });
          }
        }
      });
    },
    ArrayExpression (node) {
      node.elements.forEach(p => {
        if (p.type === 'Identifier') {
          result.push(p.name);
        }
      });
    }
  });
  return result;
}
