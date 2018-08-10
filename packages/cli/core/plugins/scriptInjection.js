const genRel = (rel) => {

  if (typeof rel === 'string')
    return rel;

  let handlerStr = '['
  rel.handlers.forEach((handler, i) => {
    handlerStr += '{';
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
  handlerStr += ']';

  let copy = Object.assign({}, rel);
  delete copy.handlers;

  return `{info: ${JSON.stringify(copy || {})}, handlers: ${handlerStr} }`;
};


exports = module.exports = function () {
  this.register('script-injection', function scriptInjection (parsed, ref) {

    let relstr = genRel(ref);
    let code = parsed.code;
    let entry = parsed.parser.entry;
    if (!entry) {
      throw new Error('Missing wepy entry in file: ' + parsed.file);
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
