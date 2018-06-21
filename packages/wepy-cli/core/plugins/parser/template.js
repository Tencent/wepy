const xmllint = require('../../util/xmllint');
const errorHandler = require('../../util/error');
const pTemplate = require('../../parseTemplate');
const { onRE } = require('../../shared/reg');

exports = module.exports = function () {
  this.register('wepy-parser-template', function (node, ctx) {
    let code = node.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });

    return this.hookUnique('template-parse', node.content).then(rst => {
      let parsed = {
        code: rst.code,
        rel: rst.rel
      };
      return parsed;
    });
  });

  // hook for custom attr transf
  // e.g: 
  // v-for => wx:for
  // v-if => wx:if
  this.register('template-parse-ast-attr', function (attrs) {
    let parsedAttr = {};
    if (attrs['class']) {
      parsedAttr.class = attrs['class'];
      delete attrs['class'];
    } else if (attrs['v-for']) {
      // {for: "list", alias: "value", iterator1: "key", iterator2: "index"}
      let forExp = pTemplate.parseFor(attrs['v-for']);
      parsedAttr['wx:for'] = `{{ ${forExp.for} }}`;
      parsedAttr['wx:for-index'] = `${forExp.iterator1 || 'index'} `;
      parsedAttr['wx:for-item'] = `${forExp.alias || 'item'} `;
      parsedAttr['wx:key'] = `${forExp.iterator2 || forExp.iterator1 || 'index'} `;
      delete attrs['v-for'];
    } else if (attrs['v-show']) {
      let exp = `{{!(${attrs['v-show']})}}`;
      parsedAttr.hidden = exp;
      delete attrs['v-show'];
    } else if (attrs['v-if']) {
      parsedAttr['wx:if'] = `{{ ${attrs['v-if']} }}`;
      delete attrs['v-if'];
    } else if (attrs['v-else-if']) {
      parsedAttr['wx:elif'] = `{{ ${attrs['v-else-if']} }}`;
      delete attrs['v-else-if'];
    } else if (attrs['v-else-if']) {
      parsedAttr['wx:else'] = `{{ ${attrs['v-else']} }}`;
      delete attrs['v-else'];
    }
    return parsedAttr;
  });

  // hook for event transf
  // e.g: 
  // @tap => bindtap
  // v-on:tap => bindtap
  this.register('template-parse-ast-attr-v-on', function (name, expr, modifiers) {
    let parsedOn = {}
    name = name.replace(onRE, '');
    let info = pTemplate.parseHandler(name, expr, modifiers);

    info.params.forEach((p, i) => {
      let paramAttr = 'data-wpy' + info.event.toLowerCase() + '-' + String.fromCharCode(97 + i);
      if (paramAttr.length > 31) {
        this.compilation.logger.warn(`Function name is too long, it may cause an Error. "${info.handler}"`);
      }
      parsedOn[paramAttr] = `{{ ${p} }}`;
    });
    parsedOn[info.type] = info.handler;
    return parsedOn;
  });

  // hook for v-model transf
  // e.g: 
  // v-model => bindinput/bindchange
  this.register('template-parse-ast-attr-v-model', function (name, expr, modifiers) {
    // Todo: added v-model transf
  })
}
