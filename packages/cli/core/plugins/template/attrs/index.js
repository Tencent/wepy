exports = module.exports = function parseAttrs () {
  [
    './bindClass',
    './bindStyle',
    './src'
  ].map(v => require(v).call(this));
};
