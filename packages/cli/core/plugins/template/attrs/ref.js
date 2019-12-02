exports = module.exports = function() {
  let totalRefCache = {};

  function getParseRefFunc(hasBindAttrRef = false) {
    return function({ item, ctx, expr, rel }) {
      let attrs = item.attribs;
      let parsedRef = {};
      let assetsId = this.assets.get(ctx.file);
      let refCache;
      let elemId;

      let components = rel.components;
      let hasAttrId = attrs.hasOwnProperty('id');
      let hasBindAttrId = attrs.hasOwnProperty(':id');

      if (!totalRefCache[assetsId]) {
        totalRefCache[assetsId] = {
          increaseId: 0
        };
      }
      refCache = totalRefCache[assetsId];

      if (!rel.refs) {
        rel.refs = [];
      }

      parsedRef.rel = rel || {};
      parsedRef.attrs = parsedRef.attrs || {};

      if (!components[item.name]) {
        if (hasAttrId || hasBindAttrId) {
          elemId = hasAttrId ? attrs['id'] : attrs[':id'];
        } else {
          elemId = `ref-${assetsId}-${refCache.increaseId}`;
          parsedRef.attrs['id'] = elemId;
          refCache.increaseId++;
        }
        rel.refs.push({
          id: {
            name: `${elemId}`,
            bind: hasBindAttrId
          },
          ref: {
            name: `${expr}`,
            bind: hasBindAttrRef
          }
        });
      } else {
        parsedRef.attrs['data-ref'] = hasBindAttrRef ? `{{ ${expr} }}` : `${expr}`;
      }
      return parsedRef;
    };
  }

  this.register('parse-template-ast-attr-ref', getParseRefFunc().bind(this));
  this.register('parse-template-ast-attr-:ref', getParseRefFunc(true).bind(this));
};
