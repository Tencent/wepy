const genRel = (rel) => {

  if (typeof rel === 'string')
    return rel;

  let handlerStr = '{'
  rel.handlers.forEach((handler, i) => {
    handlerStr += `'${i}': {`;
    let events = Object.keys(handler);
    events.forEach((e, p) => {
      handlerStr += `${e}: ${handler[e]}`;
      if (p !== events.length - 1) {
        handlerStr += ',';
      }
    });
    handlerStr += '}'
    if (i !== rel.handlers.length - 1) {
      handlerStr += ',';
    }
  });
  handlerStr += '}';

  let modelStr = '';
  for (let i in rel.models) {
    modelStr += `'${i}': {
      type: ${JSON.stringify(rel.models[i].type)},
      expr: ${JSON.stringify(rel.models[i].expr)},
      handler: ${rel.models[i].handler}
    },`;
  }
  modelStr = '{' + modelStr.substring(0, modelStr.length - 1) + '}';

  let copy = Object.assign({}, rel);
  delete copy.handlers;
  delete copy.models;

  return `{info: ${JSON.stringify(copy || {})}, handlers: ${handlerStr}, models: ${modelStr} }`;
};

exports = module.exports = function () {
  this.register('script-injection', function scriptInjection (parsed, ref) {

    let relstr = genRel(ref);
    let code = parsed.code;
    let entry = parsed.parser.entry;
    if (!entry) {
      this.hookUnique('error-handler', {
        type: 'error',
        message: `Missing wepy entry. A .wpy file should have "wepy.app", "wepy.page" or "wepy.component"`,
        ctx: {
          file: parsed.file
        }
      });
      throw new Error('EXIT');
    }
    let args = entry.arguments;
    let pos = 0;
    if (args === 0) {
      pos = entry.callee.end + 1;
    } else {
      pos = args[args.length -1].end;
      relstr = ', ' + relstr;
    }
    parsed.source.insert(pos, relstr);
  });
}
