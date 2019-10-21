exports = module.exports = function() {
  this.register('template-parse-ast-attr-ref', function parseRef({ expr }) {
    return {
      attrs: {
        'data-ref': `${expr}`
      }
    };
  });
};
