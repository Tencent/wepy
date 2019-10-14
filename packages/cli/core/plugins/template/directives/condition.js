const ADDITIONS_DIRECTIVES_HANDLES = {
  'v-show': ({item, name, expr}) => ({attrs: { hidden: `{{ !(${expr}) }}` }}),
  'v-if': ({item, name, expr}) => ({attrs: { 'wx:if': `{{ ${expr} }}` }}),
  'v-else-if': ({item, name, expr}) => ({attrs: { 'wx:elif': `{{ ${expr} }}` }}),
  'v-else': ({item, name, expr}) => ({attrs: { 'wx:else': true }})
};

const ADDITIONS_DIRECTIVES_HANDLES_ANT = {
  'v-show': ({item, name, expr}) => ({attrs: { hidden: `{{ !(${expr}) }}` }}),
  'v-if': ({item, name, expr}) => ({attrs: { 'a:if': `{{ ${expr} }}` }}),
  'v-else-if': ({item, name, expr}) => ({attrs: { 'a:elif': `{{ ${expr} }}` }}),
  'v-else': ({item, name, expr}) => ({attrs: { 'a:else': true }}),
  
  'wx:if': ({item, name, expr}) => ({attrs: { 'a:if': `${expr}` }}),
};

exports = module.exports = function () {
  let items = ADDITIONS_DIRECTIVES_HANDLES;
  if(this.options.output === 'ant')
  {
    items = ADDITIONS_DIRECTIVES_HANDLES_ANT;
  }

  Object.keys(items).forEach(directives => {
    this.register('template-parse-ast-attr-' + directives, items[directives]);
  });
};
