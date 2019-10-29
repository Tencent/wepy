exports = module.exports = function() {
  let totalRefCache = {};

  function getParseRefFunc(isBindAttr = false) {
    return function({ item, ctx, expr, rel }) {
      let parsedRef = {};
      let assetsId = this.assets.get(ctx.file);
      let refCache;
      let elemId;

      let components = rel.components;

      if (!totalRefCache[assetsId]) {
        totalRefCache[assetsId] = {
          increaseId: 0
        };
      }
      refCache = totalRefCache[assetsId];
      elemId = `ref-${assetsId}-${refCache.increaseId}`;

      if (!rel.refs) {
        rel.refs = [];
      }

      parsedRef.rel = rel || {};
      parsedRef.attrs = parsedRef.attrs || {};

      if (!components[item.name]) {
        parsedRef.attrs['id'] = elemId;
        rel.refs.push({
          elemId: elemId,
          name: `${expr}`,
          isBindAttr: isBindAttr
        });
        refCache.increaseId++;
      } else {
        parsedRef.attrs['data-ref'] = isBindAttr ? `{{ ${expr} }}` : `${expr}`;
      }
      return parsedRef;
    };
  }

  this.register('template-parse-ast-attr-ref', getParseRefFunc().bind(this));
  this.register('template-parse-ast-attr-:ref', getParseRefFunc(true).bind(this));
};
