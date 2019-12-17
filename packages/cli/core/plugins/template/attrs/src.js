const path = require('path');
const FileBead = require('../../../compile/bead').FileBead;

exports = module.exports = function() {
  this.register('url-to-module', function urlToModule(url) {
    const parsed = {};
    const firstChar = url.charAt(0);
    // if first char eqs `.` `~` or `@`, It will be treated as module processing
    if ((firstChar === '.' || firstChar === '~' || firstChar === '@') && !(url.includes('{{') || url.includes('}}'))) {
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
  });

  this.register('parse-template-ast-attr-src', function parseAssetUrl({ chain, expr }) {
    let parsed = this.hookUnique('url-to-module', expr);

    if (parsed.isModule) {
      const context = path.dirname(chain.bead.path);

      parsed.file = this.resolvers.normal.resolveSync({}, context, parsed.url, {});
      parsed.url = path.relative(path.dirname(chain.bead.path), parsed.file);

      if (path.sep === '\\') {
        // It's Win, change path to posix path
        parsed.url = parsed.url.replace(/\\/g, '/');
      }

      // add assets dependencies
      const newBead = this.producer.make(FileBead, parsed.file);
      const newChain = chain.createChain(newBead);
      this.hookUnique('make', newChain).then(c => {
        this.producer.assets(c);
      });
    }
    parsed.attr = { attrs: { src: parsed.url } };
    return parsed.attr;
  });
};
