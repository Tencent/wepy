const bindRE = /^:|^v-bind:/;

exports = module.exports = function() {
  this.register('template-parse-ast-attr-v-bind', function parseAstBind({ item, name, expr, modifiers, scope, ctx }) {
    let prop = name.replace(bindRE, '');
    let value = expr;
    expr = `{{ ${expr} }}`;
    return {
      bind: {
        name,
        prop,
        value,
        expr
      },
      attrs: {
        [prop]: expr
      }
    };
  });
};
