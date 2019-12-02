const ADDITIONS_DIRECTIVES_HANDLES = {
  /* eslint-disable no-unused-vars */
  'v-show': ({ item, name, expr }) => ({ attrs: { hidden: `{{ !(${expr}) }}` } }),
  'v-if': ({ item, name, expr }) => ({ attrs: { 'wx:if': `{{ ${expr} }}` } }),
  'v-else-if': ({ item, name, expr }) => ({ attrs: { 'wx:elif': `{{ ${expr} }}` } }),
  'v-else': ({ item, name, expr }) => ({ attrs: { 'wx:else': true } })
  /* eslint-enable no-unused-vars */
};

exports = module.exports = function() {
  Object.keys(ADDITIONS_DIRECTIVES_HANDLES).forEach(directives => {
    this.register('parse-template-ast-attr-' + directives, ADDITIONS_DIRECTIVES_HANDLES[directives]);
  });
};
