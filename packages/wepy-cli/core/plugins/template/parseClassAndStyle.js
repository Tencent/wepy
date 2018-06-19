const exprParser = require('../../util/exprParser');


exports = module.exports = function () {

  this.register('template-parse-ast-attr-:class', function parseBindClass ({item, name, expr}) {
    let exprObj = exprParser.str2obj(expr);
    item.bindClass = Object.keys(exprObj).map(name => {
      let exp = exprObj[name].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      name = name.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      return `${exp} ? '${name}' : ''`;
    });
    // return {} means remove :class
    return {};
  });


  this.register('template-parse-ast-attr-:style', function parseBindClass ({item, name, expr}) {
    let exprObj = exprParser.str2obj(expr);
    item.bindStyle = Object.keys(exprObj).map(name => {
      let exp = exprObj[name].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      name = name.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      name = exprParser.hyphenate(name);
      return `'${name}:' + ${exp} + ';'`;
    });
    // return {} means remove :class
    return {};
  });


};

