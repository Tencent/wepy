const path = require('path');

exports = module.exports = function () {
  this.register('script-dep-fix', function scriptDepFix (parsed, isNPM) {
    let code = parsed.code;
    let fixPos = 0;
    parsed.parser.deps.forEach((dep, i) => {
      let depMod = parsed.depModules[i];
      let moduleId = (typeof depMod === 'object') ? depMod.id : depMod;
      let replaceMent = '';
      if (isNPM) {
        replaceMent = `__wepy_require(${moduleId})`;
      } else {
        if (typeof depMod === 'object' && !depMod.npm && !depMod.component) {
          // dep is not a npm package, and it's not a component
          let relativePath = path.relative(path.dirname(parsed.file), depMod.file);
          replaceMent = `require('${relativePath}')`;
        } else {
          if (typeof moduleId === 'number') {
            let relativePath;
            let npmfile = path.join(this.context, this.options.src, 'vendor.js');
            if (parsed.npm) { // This is a npm package
              relativePath = path.relative(path.dirname(this.getModuleTarget(parsed.file, this.options.src)), npmfile);
            } else {
              relativePath = path.relative(path.dirname(parsed.file), npmfile);
            }
            replaceMent = `require('${relativePath}')(${moduleId})`;
          } else if (depMod && depMod.component) {
            let relativePath = path.relative(path.dirname(parsed.file), depMod.file);
            let reg = new RegExp('\\' + this.options.wpyExt + '$', 'i');
            relativePath = relativePath.replace(reg, '.js');
            replaceMent = `require('${relativePath}')`;
          } else if (depMod === false) {
            replaceMent = '{}';
          } else {
            replaceMent = `require('${dep.module}')`;
          }
        }
      }
      parsed.source.replace(dep.expr.start, dep.expr.end - 1, replaceMent);
    });
  });
}
