const path = require('path');
const ScriptBead = require('../compile/bead').ScriptBead;

function replaceDep(parsed, dep, replacer) {
  parsed.replaces.push(replacer);
  parsed.code.replace(dep.expr.start, dep.expr.end - 1, replacer);
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
    const walker = parsed.walker;
    if (!(bead instanceof ScriptBead)) {
      return chain;
    }

    walker.replacements.forEach(item => {
      replaceDep(parsed, item, item.value);
    });

    if (parsed.replaces.length === chain.series.length) {
      return chain;
    }
    chain.series.forEach((subChain, i) => {
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
  });
};
