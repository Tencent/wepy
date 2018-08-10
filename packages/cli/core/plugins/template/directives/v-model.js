const CONST = require('../../../util/const');

exports = module.exports = function () {

  this.register('template-parse-ast-attr-v-model', function parseBindClass ({item, name, expr, modifiers, scope}) {

    let attrs = item.attribs;

    let conflicts = ['value', 'v-bind', ':value'].filter(v => !!attrs[v]);

    conflicts.forEach(c => {
      this.logger.warn('v-model', `${c}="${attrs[c]}" conflicts with v-model on element <${item.name}>`);
      delete attrs[c];
    });

    expr = expr.trim();

    return {
      model: {
        tag: item.name,
        expr: expr
      }
    };
  });

  this.register('template-parse-ast-attr-v-model-apply', function parseBindClass ({ parsed, attrs, rel }) {

    let model = parsed.model;
    let expr = model.expr.trim();

    if (rel.model) {
      return;
    }

    if (model.tag === 'input') {

      attrs.value = `{{ ${expr} }}`;

      if (!attrs.bindinput) {
        attrs.bindinput = CONST.EVENT_PROXY;
      }
      rel.model = {
        type: 'input',
        expr: expr
      };
    }
  });
};

