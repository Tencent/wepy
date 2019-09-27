/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */
export function parseModel (str) {
  str = str.trim();
  let len = str.length;

  // e.g.
  // test[0].a
  // test.a.b
  if (str.indexOf('[') < 0 || str.lastIndexOf(']') < len - 1) {
    let dot = str.lastIndexOf('.');
    if (dot > -1) {
      return {
        expr: str.slice(0, dot),
        key: `${str.slice(dot + 1)}`
      };
    } else {
      return {
        expr: str,
        key: null
      };
    }
  }

  /*
   * e.g.
   * test[a[b]]
   */

  let index = 0;
  let exprStart = 0;
  let exprEnd = 0;

  let isQuoteStart = function (chr) {
    return chr === 0x22 || chr === 0x27;
  };

  let parseString = function (chr) {
    while (index < len && str.charCodeAt(++index) !== chr) {}
  };

  let parseBracket = function (chr) {
    let inBracket = 1;
    exprStart = index;
    while (index < len) {
      chr = str.charCodeAt(++index);
      if (isQuoteStart(chr)) {
        parseString(chr);
        continue;
      }
      if (chr === 0x5B)
        inBracket++;
      if (chr === 0x5D)
        inBracket--;

      if (inBracket === 0) {
        exprEnd = index
        break;
      }

    }
  };

  while (index < len) {
    let chr = str.charCodeAt(++index);
    if (isQuoteStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    expr: str.slice(0, exprStart),
    key: str.slice(exprStart + 1, exprEnd)
  };
}
