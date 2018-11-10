const fs = require('fs-extra');
const path = require('path');
const ReplaceSource = require('webpack-sources').ReplaceSource;
const RawSource = require('webpack-sources').RawSource;

const VALID_TAG = ['audio', 'image', 'video'];

exports = module.exports = function () {

  this.register('url-to-module', function urlToModule (url) {
    const parsed = {};
    const firstChar = url.charAt(0);
    // if first char eqs `.` `~` or `@`, It will be treated as module processing
    if (
      (firstChar === '.' || firstChar === '~' || firstChar === '@') &&
      !(url.includes('{{') || url.includes('}}'))
    ) {
      if (firstChar === '~') {
        const secondChar = url.charAt(1);
        url = url.slice(secondChar === '/' ? 2 : 1);
      }
      parsed.isModule = true;
    } else {
      parsed.isModule = false;
    }
    parsed.url = url;
    return parsed;
  })


  this.register('template-parse-ast-attr-src', function parseAssetUrl ({item, name, expr, ctx}) {

    let parsed = {};

    if (!VALID_TAG.includes(item.name)) {
      // ignore asset transform
      // e.g: <web-view src="https://mp.weixin.qq.com/"></web-view>
      parsed.attr = { attrs: { src: expr } };
      return parsed.attr;
    }

    parsed = this.hookUnique('url-to-module', expr);

    if (parsed.isModule) {
      const context = path.dirname(ctx.file);
      const assets = this.assets;
      const type = 'url';
      const encoding = 'base64';

      parsed.file = this.resolvers.normal.resolveSync({}, context, parsed.url, {});
      parsed.url = path.relative(path.dirname(ctx.file), parsed.file);

      const code = fs.readFileSync(parsed.file, encoding);
      const source = new ReplaceSource(new RawSource(code));

      // add assets dependencies
      let obj = {
        file: ctx.file,
        parser: {},
        code: code,
        encoding, encoding,
        source: source,
        depModules: null,
        type: type
      };
      assets.update(parsed.file, obj, { src: true });
    }
    parsed.attr = { attrs: { src: parsed.url } };
    return parsed.attr;
  });
};
