const walk = require('acorn/dist/walk');
const toAST = require('./toAST');

exports = module.exports = function parseHandler (source) {
  source = '(' + source + ');';
  ast = toAST(source);
  const statement = ast.body[0]
  let result = ''

  if (statement.type !== 'ExpressionStatement') {
    throw new Error(
      '  template handler must be a expression, like:\n' +
      '  @tap="tapHandler"\n' +
      '  @tap="m1.tapHandler"'
    );
  }

  walk.ancestor(statement, {
    MemberExpression (node) {
      if (node.object.type === 'Identifier' && !node.computed) {
        result = node.object.name
      }
    }
  });
  return result;
}