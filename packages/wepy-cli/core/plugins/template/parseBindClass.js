
const parseClassExp = (exp) => {
    exp = exp.replace(/^\s/ig, '').replace(/\s$/ig, '');
    if (exp[0] === '{' && exp[exp.length - 1] === '}') {
        exp = exp.substring(1, exp.length - 1);
        let i = 0, len = exp.length;
        let flagStack = [], flag = 'start';
        let classNames = [], result = {}, str = '';
        for (i = 0; i < len; i++) {
            if ((exp[i] === '\'' || exp[i] === '"')) {
                if (flagStack.length && flagStack[0] === exp[i]) {
                    flagStack.pop();
                    if (flag === 'class') {
                        flag = ':';
                        continue;
                    } else if (flag === 'expression') {
                        str += exp[i];
                        continue;
                    }
                } else {
                    if (flagStack.length === 0) {
                        flagStack.push(exp[i]);
                        if (flag === 'start') {
                            flag = 'class';
                            continue;
                        } else if (flag === 'expression') {
                            str += exp[i];
                            continue;
                        }
                    }
                }
            }
            // {abc: num < 1} or {'abc': num <１}
            if (exp[i] === ':' && (flag === ':' || flag === 'class') && flagStack.length === 0) {
                flag = 'expression';
                classNames.push(str);
                str = '';
                continue;
            }
            if (exp[i] === ',' && flag === 'expression' && flagStack.length === 0) {
                result[classNames[classNames.length - 1]] = str.replace(/^\s/ig, '').replace(/\s$/ig, '');;
                str = '';
                flag = 'start';
                continue;
            }
            // get rid of the begining space
            if (!str.length && exp[i] === ' ')
                continue;

            // not started with '', like {abc: num < 1}
            if (flag === 'start') {
                flag = 'class';
            }

            if (flag === 'class' || flag === 'expression') {
                str += exp[i];
            }
        }
        if (str.length) {
            result[classNames[classNames.length - 1]] = str.replace(/^\s/ig, '').replace(/\s$/ig, '');
        }
        return result;
    } else {
        throw `:class expression is not correct, it has to be {'className': mycondition}`;
    }
};

exports = module.exports = function () {

  this.register('template-parse-ast-attr-:class', function parseBindClass ({item, name, expr}) {
    let classObject = parseClassExp(expr);
    item.bindClass = Object.keys(classObject).map(name => {
      let exp = classObject[name].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      name = name.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
      return `${exp} ? '${name}' : ''`;
    });
    // return {} means remove :class
    return {};
  });
};

