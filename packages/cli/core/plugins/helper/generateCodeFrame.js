const codeFrameColumns = require('@babel/code-frame').codeFrameColumns;

function indexToLineColumns(code, index) {
  let line = 1;
  let column = 1;
  let i = 0;
  let l = code.length;
  while (i < l) {
    if (i === index) {
      break;
    }
    if (code[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    i++;
  }
  return { line, column };
}

exports = module.exports = function () {
  this.register('gen-code-frame', function (code, pos, msg, options) {

    if (pos.type === 'template') {
      return this.hookUnique('gen-code-frame-html', code, pos.item, pos.attr, pos.expr, msg, options);
    }

    options = Object.assign({}, {
      highlightCode: true,
      message: msg || ''
    }, options || {});

    if (!pos.start) {
      let newpos = {};
      if (pos.startIndex) {
        newpos.start = indexToLineColumns(code, pos.startIndex);
      }
      if (pos.endIndex) {
        newpos.end = indexToLineColumns(code, pos.endIndex);
      }
      pos = newpos;
    }
    return codeFrameColumns(code, pos, options);
  });

  this.register('gen-code-frame-html', function (code, item, attr, expr, msg, options) {

    let node = code.substring(item.startIndex, item.endIndex);
    let i = 0, l = node.length, quotes = [];
    let word = '';
    let inQuoteString = '';
    let startIndex = 0;
    let endIndex = 0;

    while (i < l) {
      let c = node[i++];
      if (c === '"' || c === "'") {
        if (quotes[quotes.length - 1] === c) {
          quotes.pop();
        } else {
          quotes.push(c);
        }
        continue;
      }
      if (quotes.length === 0) {
        inQuoteString = '';
        if (c === ' ') {
          word = '';
        } else {
          word += c;
        }
      } else {
        inQuoteString += c;
      }

      if (word === attr) {
        startIndex = i - word.length;
      }
      if (inQuoteString === expr) {
        endIndex = i;
      }
    }
    return this.hookUnique('gen-code-frame', code, { startIndex: item.startIndex + startIndex, endIndex: item.startIndex + endIndex + 1 }, msg, options);

  });
}
