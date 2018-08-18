const bindRE = /^:|^v-bind:/;

exports = module.exports = function () {
  
  this.register('template-parse-ast-attr-v-bind', function parseAstBind (item, name, value, modifiers, scope) {
    return {
      name: name,
      prop: name.replace(bindRE, ''),
      value: value,
      expr: `{{ ${value} }}`
    };
  });
};
