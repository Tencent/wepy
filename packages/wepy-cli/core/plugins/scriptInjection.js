function genHandlers (handlers) {

  if (typeof handlers === 'string')
    return handlers;

  let params = '{ handlers: [';
  handlers.forEach((handler, i) => {
    params += '{';
    let events = Object.keys(handler);
    events.forEach((e, p) => {
      params += `${e}: ${handler[e]}`;
      if (p !== events.length - 1) {
        params += ',';
      }
    });
    params += '}'
    if (i !== handlers.length - 1) {
      params += ',';
    }
  });
  params += '] }';
  return params;
}


exports = module.exports = function () {
  this.register('script-injection', function scriptInjection (parsed, data) {

    let params = genHandlers(data);
    let code = parsed.code;
    let entry = parsed.parser.entry;
    let args = entry.arguments;
    let pos = 0;
    if (args === 0) {
      pos = entry.callee.end + 1;
    } else {
      pos = args[args.length -1].end;
      params = ', ' + params;
    }
    parsed.source.insert(pos, params);
  });
}
