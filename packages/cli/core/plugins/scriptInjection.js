const genRel = rel => {
  if (typeof rel === 'string') return rel;

  let handlerStr = '{';
  for (let h in rel.handlers) {
    let handler = rel.handlers[h];
    handlerStr += `'${h}': {`;
    if (typeof handler === 'object') {
      let events = Object.keys(handler);
      events.forEach((e, p) => {
        handlerStr += `${JSON.stringify(e)}: ${handler[e]}`;
        if (p !== events.length - 1) {
          handlerStr += ', ';
        }
      });
    }
    handlerStr += '},';
  }
  if (handlerStr.length > 2) {
    handlerStr = handlerStr.substring(0, handlerStr.length - 1);
  }
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

  return `{info: ${JSON.stringify(copy || {})}, handlers: ${handlerStr}, models: ${modelStr}, refs: ${JSON.stringify(
    rel.refs
  )} }`;
};

exports = module.exports = function() {
  this.register('script-injection', function scriptInjection(chain, ref) {
    const bead = chain.bead;
    const parsed = bead.parsed;
    const source = parsed.source;
    let relStr = genRel(ref);
    let entry = parsed.walker.entry;
    if (!entry) {
      this.hookUnique('error-handler', {
        type: 'warn',
        message: `Missing wepy entry. A .wpy file should have "wepy.app", "wepy.page" or "wepy.component"`,
        ctx: {
          file: parsed.file
        }
      });
      return;
    }
    let args = entry.arguments;
    let pos = 0;
    if (args === 0) {
      pos = entry.callee.end + 1;
    } else {
      pos = args[args.length - 1].end;
      relStr = ', ' + relStr;
    }

    // avoid to import duplicated
    // eslint-disable-next-line
    if (source.relIndex != null) {
      const idx = source.replacements.findIndex(arr => {
        return arr[arr.length - 1] === source.relIndex;
      });
      if (idx !== -1) {
        source.replacements.splice(idx, 1);
      }
    }
    source.insert(pos, relStr);
    source.relIndex = source.replacements.length - 1;
  });
};
