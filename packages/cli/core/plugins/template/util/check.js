// strip strings in expressions
const stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');


exports = module.exports = {
  checkExpression: function (expr, text) {
    try {
      new Function(('return ' + expr));
    } catch (e) {
      let keywordMatch = expr.replace(stripStringRE, '').match(prohibitedKeywordRE);
      if (keywordMatch) {
        return `avoid using Javascript keyword as property name: "${keywordMatch[0]}". Raw expression: ${text.trim()}`;
      } else {
        return `Invalid expression: ${e.message} in "${expr}". Raw Expression: ${text.trim()}`;
      }
    }
  }
};
