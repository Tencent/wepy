const {
  isArr,
  isFunc
} = require('../util/tools');

function normalizeCustomPlugins (ins, plugins) {
  if (!isArr(plugins)) {
    plugins = [plugins];
  }

  plugins.forEach((plg, index) => {
    if (!isFunc(plg)) {
      ins.logger.error('init', `Plugins init error, plugin ${plg.name} must be a function`);
    }
  })

  return plugins;
}

exports = module.exports = function (ins) {
  // system plugins
  let systemPluginFns = [
    './../plugins/scriptDepFix',
    './../plugins/scriptInjection',
    './../plugins/build/app',
    './../plugins/build/pages',
    './../plugins/build/components',
    './../plugins/build/vendor',
    './../plugins/build/assets',

    './../plugins/template/parse',

    './../plugins/template/attrs',
    './../plugins/template/directives',


    './../plugins/helper/supportSrc',
    './../plugins/helper/sfcCustomBlock',
    './../plugins/helper/generateCodeFrame',
    './../plugins/helper/errorHandler',

    './../plugins/compiler/index',

  ].map(p => require(p));
  // custom plugins
  let customPluginFns = normalizeCustomPlugins(ins, ins.options.plugins);

  [
    ...systemPluginFns,
    ...customPluginFns
  ].map(v => v.call(ins));

  (ins.options.plugins || []).map(fn => fn.call(ins));

}
