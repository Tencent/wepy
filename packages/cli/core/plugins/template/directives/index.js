exports = module.exports = function parseDirectives () {
  [
    './additions',
    './bind',
    './for',
    './model',
    './on'
  ].map(v => require(v).call(this));
};
