const path = require('path');
const hashUtil = require('../../util/hash');

exports = module.exports = function () {
  this.register('wepy-parser-wxs', function (node, ctx) {

    if (ctx.useCache && ctx.sfc.template.parsed) {
      return Promise.resolve(true);
    }
    let moduleId = node.attrs.module;
    let code = node.compiled.code.trim();
    let output = `<wxs module="${moduleId}"${node.src ? ' src="' + node.src + '"' : ''}>${!node.src ? '\n' + code + '\n' : ''}</wxs>`;
    node.parsed = {
      output
    };
    const fileHash = hashUtil.hash(code);
    let file = node.src ? path.resolve(path.dirname(ctx.file), node.src) : ctx.file;
    let wxsCtx = null;

    // If node has src, then use src file cache
    if (node.src && this.compiled[file] && fileHash === this.compiled[file].hash) {
      wxsCtx = this.compiled[file];
      wxsCtx.useCache = true;
      return Promise.resolve(wxsCtx);
    } else {
      wxsCtx = {
        file,
        component: ctx.component,
        npm: ctx.npm,
        wxs: true,
        type: 'wxs'
      };
      this.compiled[file] = wxsCtx;
      if (node.src) {
        wxsCtx.hash = fileHash;
        this.assets.add(wxsCtx.file, {
          npm: wxsCtx.npm,
          wxs: true,
          dep: true,
          component: wxsCtx.component,
          type: wxsCtx.type
        });
      }
    }

    return this.applyCompiler({ type: 'script', lang: node.lang, content: code }, wxsCtx);
  });
};
