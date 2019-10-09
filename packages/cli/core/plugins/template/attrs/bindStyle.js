const exprParser = require('../../../util/exprParser');

exports = module.exports = function () {
  this.register('template-parse-ast-attr-:style', function parseBindStyle({ item, name, expr }) {
    let exprObj = exprParser.str2obj(expr);
    item.bindStyle = Object.keys(exprObj).map(name => {
      let exp = exprObj[name].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');

      // add brackets to fix priority of "+" operator.
      if (/^\(.*\)$/.test(exp) === false) {
        exp = `(${exp})`;
      }
      name = name.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      name = exprParser.hyphenate(name);
      return `'${name}:' + ${exp} + ';'`;
    });
    // return {} means remove :class
    return { attrs: {} };
  });
};
