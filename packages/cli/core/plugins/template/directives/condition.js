const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
};

function decodeAttr(value, shouldDecodeNewlines) {
  return value.replace(/&(?:lt|gt|amp);/g, function (match) { return decodingMap[match]; })
}

const ADDITIONS_DIRECTIVES_HANDLES = {
  /* eslint-disable no-unused-vars */
  'v-show': ({ item, name, expr }) => ({ attrs: { hidden: `{{ !(${decodeAttr(expr)}) }}` } }),
  'v-if': ({ item, name, expr }) => ({ attrs: { 'wx:if': `{{ ${decodeAttr(expr)} }}` } }),
  'v-else-if': ({ item, name, expr }) => ({ attrs: { 'wx:elif': `{{ ${decodeAttr(expr)} }}` } }),
  'v-else': ({ item, name, expr }) => ({ attrs: { 'wx:else': true } })
  /* eslint-enable no-unused-vars */
};

exports = module.exports = function() {
  Object.keys(ADDITIONS_DIRECTIVES_HANDLES).forEach(directives => {
    this.register('template-parse-ast-attr-' + directives, ADDITIONS_DIRECTIVES_HANDLES[directives]);
  });
};
