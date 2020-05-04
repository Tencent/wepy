const path = require('path');
const fs = require('fs');
const loaderUtils = require('loader-utils');

const trailingSlash = /[/\\]$/;

exports = module.exports = function() {
  this.register('pre-check-sfc', function(ctx) {
    let node = ctx.node;
    let file = ctx.file;
    let dir = path.parse(file).dir;

    if (node && node.src) {
      let src = node.src;
      const request = loaderUtils.urlToRequest(src, src.charAt(0) === '/' ? '' : null);
      dir = dir.replace(trailingSlash, '');
      return this.resolvers.normal.resolve({}, dir, request, {}).then(rst => {
        node.content = fs.readFileSync(rst.path, 'utf-8');
        node.dirty = true;
        return {
          node: node,
          file: file
        };
      });
    } else {
      return Promise.resolve({
        node: node,
        file: file
      });
    }
  });
};
