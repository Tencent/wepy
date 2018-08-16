exports = module.exports = function parseDirectives () {
  [
    './condition',
    './bind',
    './for',
    './model',
    './on'
  ].map(v => require(v).call(this));
};
