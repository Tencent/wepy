exports = module.exports = function parseDirectives () {
  [
    './condition',
    './bind',
    './for',
    './model',
    './v-on'
  ].map(v => require(v).call(this));
};
