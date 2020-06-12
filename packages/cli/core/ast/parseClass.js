const walk = require('acorn/dist/walk');
const toAST = require('./toAST');

exports = module.exports = function parseClass(source) {
  const ast = toAST(source);
  let result = [];
  walk.ancestor(ast, {
    ObjectExpression(node) {
      node.properties.forEach(p => {
        let value = p.key.type === 'Identifier' ? p.key.name : p.key.type === 'Literal' ? p.key.value : undefined;
        if (value) {
          if (p.value.type === 'Identifier') {
            result.push({
              [value]: p.value.name
            });
          } else {
            result.push({
              [value]: source.substring(p.value.start, p.value.end)
            });
          }
        }
      });
    },
    ArrayExpression(node) {
      node.elements.forEach(p => {
        if (p.type === 'Identifier') {
          result.push(p.name);
        }
      });
    },
    ConditionalExpression(node) {
      result.push(source);
    }
  });

  return result;
};
