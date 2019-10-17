const CONST = require('../../../util/const');
const vueWithTransform = require('vue-template-es2015-compiler');

const MODEL_MAP = {
  input: {
    type: 'input',
    value: 'value'
  },
  textarea: {
    type: 'input',
    value: 'value'
  },
  picker: {
    type: 'change',
    value: 'value'
  },
  switch: {
    type: 'change',
    value: 'checked'
  },
  'checkbox-group': {
    // TODO: Can not set data for checkbox-group
    type: 'change',
    value: null
  },
  'radio-group': {
    type: 'change',
    value: null
  },
  picker: {
    type: 'change',
    value: 'value'
  }
};

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */
function parseModel(str) {
  str = str.trim();
  let len = str.length;

  // e.g.
  // test[0].a
  // test.a.b
  if (str.indexOf('[') < 0 || str.lastIndexOf(']') < len - 1) {
    let dot = str.lastIndexOf('.');
    if (dot > -1) {
      return {
        expr: str.slice(0, dot),
        key: `${str.slice(dot + 1)}`
      };
    } else {
      return {
        expr: str,
        key: null
      };
    }
  }

  /*
   * e.g.
   * test[a[b]]
   */

  let index = 0;
  let exprStart = 0;
  let exprEnd = 0;

  let isQuoteStart = function(chr) {
    return chr === 0x22 || chr === 0x27;
  };

  let parseString = function(chr) {
    while (index < len && str.charCodeAt(++index) !== chr) {}
  };

  let parseBracket = function(chr) {
    let inBracket = 1;
    exprStart = index;
    while (index < len) {
      chr = str.charCodeAt(++index);
      if (isQuoteStart(chr)) {
        parseString(chr);
        continue;
      }
      if (chr === 0x5b) inBracket++;
      if (chr === 0x5d) inBracket--;

      if (inBracket === 0) {
        exprEnd = index;
        break;
      }
    }
  };

  while (index < len) {
    let chr = str.charCodeAt(++index);
    if (isQuoteStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5b) {
      parseBracket(chr);
    }
  }

  return {
    expr: str.slice(0, exprStart),
    key: str.slice(exprStart + 1, exprEnd)
  };
}

function generateModelFunction(expr) {
  let func = '';
  let parsed = parseModel(expr);
  if (parsed.key === null) {
    // it has to be  " something = $v "
    // cannot be  ['something'] = $v
    func = `function set ($v) {
      with (this) {
        ${expr} = $v;
      }
    }`;
  } else {
    func = `function set ($v) {
      with (this) {
        $set(${parsed.expr}, "${parsed.key}", $v);
      }
    }`;
  }
  func = vueWithTransform(func);
  func = func.replace('var _h=_vm.$createElement;var _c=_vm._self._c||_h;', ''); // removed unused vue code;
  return func;
}

function generateModelFunctionInScope(scope, iterators, expr) {
  let l = iterators.length;
  let i = 0;
  let func = [];

  let fetch = scope;
  let lastFor = scope.for;

  let parsed = parseModel(expr);

  while (fetch) {
    if (i === 0) {
      if (parsed.key === null) {
        func.push(`function fn${l - i}(${fetch.alias}) {
          ${expr} = $v;
        }`);
      } else {
        func.push(`function fn${l - i}(${fetch.alias}) {
          $set(${parsed.expr}, "${parsed.key}", $v);
        }`);
      }
    } else {
      func.push(`function fn${l - i}(${fetch.alias}) {
        return fn${l - i + 1}((${lastFor})[$p[${l - i}]]);
      }`);
    }
    i++;
    lastFor = fetch.for;
    fetch = fetch.parent;
  }

  // Use a special param, if user define the reserve param, then it will have an error.
  func = `function set ($v, $p) {
    with (this) {
      ${func.join('\n')}
      return fn1((${lastFor})[$p[0]]);
    }
  }`;

  func = vueWithTransform(func);
  func = func.replace('var _h=_vm.$createElement;var _c=_vm._self._c||_h;', ''); // removed unused vue code;

  return func;
}

exports = module.exports = function() {
  let modelid = 0;

  this.register('template-parse-ast-attr-v-model', function parseVModel({ item, name, expr, modifiers, scope, ctx }) {
    let attrs = item.attribs;

    let conflicts = ['value', 'v-bind', ':value'].filter(v => !!attrs[v]);

    conflicts.forEach(c => {
      this.logger.warn('v-model', `${c}="${attrs[c]}" conflicts with v-model on element <${item.name}>`);
      delete attrs[c];
    });

    expr = expr.trim();

    let param = '',
      i = 0;
    while (i < expr.length && expr[i] !== '.' && expr[i] !== '[') {
      // get v-model param, like item.checked or item[0]
      param += expr[i++];
    }

    let rst = {
      attrs: {},
      model: {
        id: modelid++,
        tag: item.name,
        expr: expr
      }
    };
    if (scope) {
      let iterators = [];
      let fetchScope = scope;
      let level = 0;
      let referScope = null;
      while (fetchScope) {
        level++;

        // Get all iterators from parent scopes
        if (!referScope && fetchScope.declared.indexOf(param) > -1) {
          referScope = fetchScope;
          iterators = [];
        }
        if (referScope) {
          if (!fetchScope.iterator1) {
            this.logger.error(
              'v-for',
              `Missing iterator index in "${fetchScope.expr}". If you want to use v-model inside a v-for. then you have to declare a iterator index, like "(item, index) in list".`
            );
          } else {
            if (iterators.indexOf(fetchScope.iterator1) > -1) {
              // index exists
              this.logger.warn('v-for', `Duplicated iterator in "${fetchScope.expr}"`);
            }
            iterators.push(fetchScope.iterator1);
          }
        }
        fetchScope = fetchScope.parent;
      }

      if (iterators && iterators.length) {
        rst.model.scopeInfo = {
          referScope: referScope,
          scope: scope,
          param: param,
          level: level,
          iterators: iterators
        };
      }
    }
    return rst;
  });

  this.register('template-parse-ast-attr-v-model-apply', function parseVModelApply({ parsed, rel }) {
    let model = parsed.model;
    let expr = model.expr.trim();
    let attrs = parsed.attrs;

    if (rel.model) {
      return;
    }

    if (model.tag === 'radio' || model.tag === 'checkbox') {
      // checkbox and radio do not have bindchange event.
      this.logger.warn(
        'v-model',
        `<${model.tag} /> do not support v-model, please use <${model.tag}-group /> instead.`
      );
    }

    let map = MODEL_MAP[model.tag];
    if (map) {
      if (map.value) {
        attrs[map.value] = `{{ ${expr} }}`;
      }

      // 支付宝
      if(this.options.output === 'ant'){
        var attrType;
        if(map.type === 'input'){
          attrType = 'onInput'
        }else{
          attrType = `bind${map.type}`;
        }

        if (!attrs[attrType]) {
          attrs[attrType] = CONST.EVENT_PROXY;
        }
      }else{
        if (!attrs[`bind${map.type}`]) {
          attrs[`bind${map.type}`] = CONST.EVENT_PROXY;
        }
      }

      if (!rel.models) {
        rel.models = [];
      }
      rel.models[model.id] = {
        type: map.type,
        expr: expr
      };

      if (model.id !== undefined) {
        attrs['data-model-id'] = model.id;
      }

      if (model.scopeInfo) {
        // v-model in v-for
        let iterators = model.scopeInfo.iterators;
        let i = iterators.length;
        let p = 0;
        if (i > 26) {
          this.logger.error('v-model', 'Too deep in v-for');
        }
        while (--i >= 0) {
          let attr = `data-model-` + String.fromCharCode(97 + p++);
          attrs[attr] = `{{ ${iterators[i]} }}`;
        }

        rel.models[model.id].handler = generateModelFunctionInScope(model.scopeInfo.referScope, iterators, expr);
      } else {
        rel.models[model.id].handler = generateModelFunction(expr);
      }
    }

    return { parsed, rel };
  });
};
