const parseClass = require('../../../ast/parseClass');

exports = module.exports = function() {
  this.register('parse-template-ast-attr-:class', function parseBindClass({ item, expr }) {
    let exprArray = parseClass(expr);
    let bindClass = [];
    exprArray.forEach(item => {
      if (typeof item === 'string') {
        bindClass.push(`${item}`);
      } else {
        Object.keys(item).forEach(name => {
          // eslint-disable-next-line
          let exp = item[name].replace(/\'/gi, '\\\'').replace(/\"/gi, '\\"');
          // eslint-disable-next-line
          name = name.replace(/\'/gi, '\\\'').replace(/\"/gi, '\\"');
          bindClass.push(`${exp} ? '${name}' : ''`);
        });
      }
    });
    item.bindClass = bindClass;

    return { attrs: {} };
  });
};
