const path = require('path');
const fs = require('fs');

exports = module.exports = function () {
  this.register('pre-check-sfc', function (ctx) {
    let node = ctx.node;
    let file = ctx.file;
    return new Promise((resolve, reject) => {
      if (node && node.src) {
        let srcPath = path.resolve(path.dirname(file), node.src);
        try {
          node.content = fs.readFileSync(srcPath, 'utf-8');
          node.dirty = true;
        } catch (e) {
          reject(new Error(`Unable to open file "${node.src}" in ${file}`));
        }
      }
      resolve({
        node: node,
        file: file
      });
    });
  });
}
