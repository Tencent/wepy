'use strict';

const WHITE_SPACES = {
  32: 'Space',
  9: 'Tab'
};

exports.getIndent = function getIndent(str) {
  const arr = str.split('\n');
  while (arr.length && !/\w/.test(arr[0])) {
    arr.shift();
  }
  const indent = {
    firstLineIndent: 0,
    indent: 0,
    char: ''
  };
  let s = arr[0];
  let i = 0;
  if (WHITE_SPACES[s.charCodeAt(0)]) {
    indent.char = s[0];
  }
  while (s[i] === indent.char) {
    i++;
  }
  indent.firstLineIndent = i;
  if (!arr[1]) {
    return indent;
  }
  s = arr[1], i = 0;
  if (!indent.char && WHITE_SPACES[s.charCodeAt(0)]) {
    indent.char = s[0];
  }
  while (s[i] === indent.char) {
    i++;
  }
  indent.indent = i - indent.firstLineIndent;
  return indent;
};

exports.fixIndent = function fixIndent(str, num, char) {
  if (char === undefined) {
    let indent = getIndent(str);
    char = indent.char;
  }
  let arr = str.split('\n');
  if (num > 0) {
    arr.forEach((v, i) => {
      let p = 0;
      while (p++ < num) {
        arr[i] = char + arr[i];
      }
    });
  } else {
    arr = arr.map((v, i) => v.substr(-1 * num));
  }
  return arr.join('\n');
};
