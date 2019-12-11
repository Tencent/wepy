exports = module.exports = function parseAttrs() {
  ['./directives/others'].map(v => require(v).call(this));
};
