const CONST = require('../../../util/const');

const MODEL_MAP = {
  input: {
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
  "checkbox-group": { // TODO: Can not set data for checkbox-group
    type: 'change',
    value: null
  },
  "radio-group": {
    type: 'change',
    value: null
  },
  picker: {
    type: 'change',
    value: 'value'
  }
};

exports = module.exports = function () {

  this.register('template-parse-ast-attr-v-model', function parseBindClass ({item, name, expr, modifiers, scope}) {

    let attrs = item.attribs;

    let conflicts = ['value', 'v-bind', ':value'].filter(v => !!attrs[v]);

    conflicts.forEach(c => {
      this.logger.warn('v-model', `${c}="${attrs[c]}" conflicts with v-model on element <${item.name}>`);
      delete attrs[c];
    });

    expr = expr.trim();

    let param = '', i = 0;
    while (i < expr.length && expr[i] !== '.' && expr[i] !== '[') {  // get v-model params, like item.checked or item[0]
      params += expr[i];
    }
    if (scope && scope.declared.indexOf(param) > -1) {
      // TODO: v-model in v-for
    }

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

    if (model.tag === 'radio' || model.tag === 'checkbox') { // checkbox and radio do not have bindchange event.
      this.logger.warn('v-model', `<${model.tag} /> do not support v-model, please use <${model.tag}-group /> instead.`);
    }

    let map = MODEL_MAP[model.tag];
    if (map) {
      if (map.value) {
        attrs[map.value] = `{{ ${expr} }}`;
      }

      if (!attrs[`bind${map.type}`]) {
        attrs[`bind${map.type}`] = CONST.EVENT_PROXY;
      }

      rel.model = {
        type: map.type,
        expr: expr
      }
    }
  });
};

