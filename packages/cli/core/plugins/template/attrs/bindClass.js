const parseClass = require('../../../ast/parseClass');

exports = module.exports = function() {
  this.register('template-parse-ast-attr-:class', function parseBindClass({ item, expr, ctx }) {
    let exprArray = [];
    try {
      exprArray = parseClass(expr);
    } catch (e) {
      this.hookUnique(
        'error-handler',
        'template',
        {
          code: expr,
          ctx,
          type: 'error',
          message: 'Can not parse ":class" expression',
          title: ':class'
        },
        { item }
      );
      throw new Error('EXIT');
    }
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
