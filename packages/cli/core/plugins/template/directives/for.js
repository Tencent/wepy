const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const variableRE = /^\s*[a-zA-Z\$_][a-zA-Z\d_]*\s*$/;

exports = module.exports = function () {
  
  this.register('template-parse-ast-attr-v-for', function parseDirectivesFor ({item, name, expr, parentScope}) {
    let res = {};
    let scope = {};
    let inMatch = expr.match(forAliasRE);
    let variableMatch = expr.match(variableRE);
    if (variableMatch) {
      // e.g: v-for="items"
      res.alias = 'item';
      res.for = variableMatch[0].trim();
      scope.for = res.for;
      scope.declared = [];
    }

    if (inMatch) {
      scope.declared = scope.declared || [];
      res.for = inMatch[2].trim();
      let alias = inMatch[1].trim().replace(stripParensRE, '');
      let iteratorMatch = alias.match(forIteratorRE);
      if (iteratorMatch) {
        res.alias = alias.replace(forIteratorRE, '').trim();
        scope.declared.push(res.alias);
        scope.alias = res.alias;
        res.iterator1 = iteratorMatch[1].trim();
        scope.iterator1 = res.iterator1;
        scope.declared.push(res.iterator1);
        if (iteratorMatch[2]) {
          res.iterator2 = iteratorMatch[2].trim();
          scope.iterator2 = res.iterator2;
          scope.declared.push(res.iterator2);
        }
      } else {
        res.alias = alias;
        scope.alias = alias;
        scope.declared.push(alias);
      }
    }
    if (parentScope)
      scope.parent = parentScope;
    return {
      scope: scope,
      attrs: {
        'wx:for': `{{ ${res.for} }}`,
        'wx:for-index': `${res.iterator1 || 'index'}`,
        'wx:for-item': `${res.alias || 'item'}`,
        'wx:key': `${res.iterator2 || res.iterator1 || 'index'}`
      }
    };
  });
};
