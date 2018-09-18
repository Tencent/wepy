exports = module.exports = function parseAttrs () {
  [
    './bindClass',
    './bindStyle',
    './src',
    './ref'
  ].map(v => require(v).call(this));
};
