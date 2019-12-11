exports = module.exports = function() {
  this.register('parse-template-ast-attr-[other]', function parseDirectivesFor({ name, expr }) {
    return {
      attrs: {
        [name]: expr
      }
    };
  });

  this.register('parse-template-ast-attr-[other]-apply', function applyDirective({ payload }) {
    return payload;
  });
};
