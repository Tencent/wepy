const parseClass = require('../../../ast/parseClass');

exports = module.exports = function () {

  this.register('template-parse-ast-attr-:class', function parseBindClass ({item, name, expr}) {
    let exprArray = parseClass(expr);
    let bindClass = [];
    exprArray.forEach(item => {
      if (typeof item === 'string') {
        bindClass.push(`${item}`);
      } else {
        Object.keys(item).forEach(name => {
          let exp = item[name].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
          name = name.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
          bindClass.push(`${exp} ? '${name}' : ''`);
        });
      }
    });
    item.bindClass = bindClass;

    return { attrs: {} };
  });
};
