const path = require('path');
const hashUtil = require('../../util/hash');

exports = module.exports = function() {
  this.register('parse-wxs', function(node, ctx) {
    if (ctx.useCache && !node.src && ctx.sfc.template.parsed) {
      return Promise.resolve(true);
    }
    let moduleId = node.attrs.module;
    let code = node.compiled.code.trim();
    let output = `<wxs module="${moduleId}"${node.src ? ' src="' + node.src + '"' : ''}>${
      !node.src ? '\n' + code + '\n' : ''
    }</wxs>`;
    node.parsed = {
      output
    };
    const fileHash = node.src ? hashUtil.hash(code) : ctx.hash;
    // If have src attribute, then use src.wxs as ctx key
    // If do not have src, then create a fake xxx.wpy_wxs as ctx key.
    // Can not use wpy ctx, because it's generated in wpy parse.
    const cacheKey = node.src ? path.resolve(path.dirname(ctx.file), node.src) : ctx.file + '_wxs';
    const isHashEqual = !!this.compiled[cacheKey] && fileHash === this.compiled[cacheKey].hash;
    let wxsCtx = null;

    if (node.src && isHashEqual) {
      // If node has src, then use src file cache
      wxsCtx = this.compiled[cacheKey];
      wxsCtx.useCache = true;
      return Promise.resolve(wxsCtx);
    } else {
      wxsCtx = Object.assign({}, ctx, {
        // If node have a src, then ctx.file has to be node.src related, otherwise, there will be an error while require a wxs file in the wxs file
        file: node.src ? cacheKey : ctx.file,
        wxs: true,
        hash: fileHash
      });
      this.compiled[cacheKey] = wxsCtx;

      // If sfc file hash is equal
      if (isHashEqual) {
        return Promise.resolve(wxsCtx);
      }
      if (node.src) {
        this.assets.add(cacheKey, {
          npm: wxsCtx.npm,
          wxs: true,
          dep: true,
          component: wxsCtx.component,
          type: wxsCtx.type
        });
      }
    }

    node = {
      type: 'script',
      lang: node.lang,
      content: code,
      src: node.src
    };
    return this.applyCompiler(node, wxsCtx);
  });
};
