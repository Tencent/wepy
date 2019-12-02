const path = require('path');

function replaceDep(parsed, dep, replacer) {
  parsed.replaces.push(replacer);
  parsed.source.replace(dep.expr.start, dep.expr.end - 1, replacer);
}

/*
 * resovle relative require
 * e.g.
 * pages/a.js require util/b.js
 * resolve to:
 * require('../b.js');
 */
function resovleRelativeRequire(bead, subBead) {
  // use relative path
  let relativePath = path.relative(path.dirname(bead.path), subBead.path).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return `require('${relativePath}')`;
}

/*
 * resovle a npm require
 * e.g.
 * pages/a.js require('npm')
 * resolve to:
 * require('../vendor.js')(${npmId});
 */
function resovleVendorRequire(root, src, bead, subBead) {
  let vendorjs = path.isAbsolute(src) ? path.join(src, 'vendor.js') : path.join(root, src, 'vendor.js');

  let relativePath = path.relative(path.dirname(bead.path), vendorjs);
  relativePath = relativePath.replace(/\\/g, '/');
  return `require('./${relativePath}')('m${subBead.no}')`;
}

/*
 * resovle a npm require
 * e.g.
 * npm.js require('another-npm')
 * resolve to:
 * __wepy_require(m${anotherNpmId});
 */
function resovleNpmRequire(subBead) {
  return `__wepy_require('m${subBead.no}')`;
}

exports = module.exports = function() {
  /*
   * S1: __wepy_require(n);
   * S2: require('./lib/sth');
   * S3: require('/vendor.js')(n);
   * S4: import 'xxxx' from 'xxx';j
   */
  this.register('script-dep-fix', function scriptDepFix(chain) {
    const bead = chain.bead;
    const parsed = bead.parsed;

    if (parsed.replaces.length === chain.series.length) {
      return chain;
    }
    chain.series.forEach((subChain, i) => {
      debugger;
      let replaceMent = '';
      const subBead = subChain.bead;
      if (!chain.belong().npm && !chain.self().npm) {
        if (!subChain.belong().npm && !subChain.self().npm) {
          replaceMent = resovleRelativeRequire(bead, subBead);
        } else {
          replaceMent = resovleVendorRequire(this.context, this.options.src, bead, subBead);
        }
      } else {
        replaceMent = resovleNpmRequire(subBead);
      }
      replaceDep(parsed, parsed.dependences[i], replaceMent);
    });
    return chain;

    if (!parsed.fixedDeps) {
      parsed.fixedDeps = [];
    }
    if (!parsed.fixedReplacement && parsed.parser.replacements) {
      parsed.parser.replacements.forEach(item => {
        parsed.source.replace(item.expr.start, item.expr.end - 1, item.value);
      });
      parsed.fixedReplacement = true;
    }
    parsed.parser.deps.forEach((dep, i) => {
      if (!parsed.fixedDeps[i]) {
        let depMod = parsed.depModules[i];
        if (typeof depMod === 'number') {
          depMod = this.vendors.data(depMod);
        }
        // TODO: optimize
        // compiled info is not equal asserts, vendorId is missing sometime
        // always use assets data instead of compiled info.
        depMod = this.assets.data(depMod.file) || depMod;

        let modFilePath = depMod.file;
        let modFilePathObj = path.parse(modFilePath);
        if (depMod.outputFileName && modFilePathObj.base !== depMod.outputFileName) {
          modFilePath = path.join(modFilePathObj.dir, depMod.outputFileName);
        }
        if (path.extname(modFilePath) === '.ts') {
          modFilePath = modFilePath.slice(0, -2) + 'js';
        }
        let replaceMent = '';
        if (isNPM) {
          if (depMod.vendorId === undefined) {
            depMod = this.vendors.data(depMod.file);
          }
          replaceMent = `__wepy_require(${depMod.vendorId})`;
        } else {
          if (depMod === false) {
            replaceMent = '{}';
          } else if (!depMod.npm || (depMod.component && depMod.type === 'weapp')) {
            //depMod dep is not a npm package, and it's not a component
            let relativePath = path.relative(path.dirname(parsed.file), modFilePath).replace(/\\/g, '/');
            if (dep.statement && dep.statement.type === 'ImportDeclaration') {
              // import 'xxxxx' from 'xxxxx';
              replaceMent = `'${relativePath}'`;
            } else {
              replaceMent = `require('./${relativePath}')`;
            }
          } else if (!depMod.npm && depMod.component) {
            let relativePath = path.relative(path.dirname(parsed.file), modFilePath);
            let reg = new RegExp('\\' + this.options.wpyExt + '$', 'i');
            relativePath = relativePath.replace(reg, '.js').replace(/\\/g, '/');
            replaceMent = `require('./${relativePath}')`;
          } else {
            if (typeof depMod.vendorId === 'number') {
              let relativePath;
              let npmfile = path.join(this.context, this.options.src, 'vendor.js');
              if (parsed.npm) {
                // This is a npm package
                relativePath = path.relative(
                  path.dirname(this.getModuleTarget(parsed.file, this.options.src)),
                  npmfile
                );
              } else {
                relativePath = path.relative(path.dirname(parsed.file), npmfile);
              }
              relativePath = relativePath.replace(/\\/g, '/');
              replaceMent = `require('./${relativePath}')(${depMod.vendorId})`;
            } else {
              replaceMent = `require('./${dep.module}')`;
            }
          }
        }
        parsed.source.replace(dep.expr.start, dep.expr.end - 1, replaceMent);
        parsed.fixedDeps[i] = true;
      }
    });
  });
};
