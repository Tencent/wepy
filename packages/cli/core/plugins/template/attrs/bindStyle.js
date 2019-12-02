const exprParser = require('../../../util/exprParser');

exports = module.exports = function() {
  this.register('parse-template-ast-attr-:style', function parseBindStyle({ item, expr }) {
    let exprObj = exprParser.str2obj(expr);
    item.bindStyle = Object.keys(exprObj).map(name => {
      // eslint-disable-next-line
      let exp = exprObj[name].replace(/\'/gi, '\\\'').replace(/\"/gi, '\\"');

      // add brackets to fix priority of "+" operator.
      if (/^\(.*\)$/.test(exp) === false) {
        exp = `(${exp})`;
      }
      // eslint-disable-next-line
      name = name.replace(/\'/gi, '\\\'').replace(/\"/gi, '\\"');
      name = exprParser.hyphenate(name);
      return `'${name}:' + ${exp} + ';'`;
    });
    // return {} means remove :class
    return { attrs: {} };
  });
};
