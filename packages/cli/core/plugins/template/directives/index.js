exports = module.exports = function parseDirectives() {
  ['./condition', './bind', './for', './model', './other', './v-on'].map(v => require(v).call(this));
};
