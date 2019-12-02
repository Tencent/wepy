const { isArr, isFunc } = require('../util/tools');

function checkPlugins(ins, plugins) {
  if (!isArr(plugins)) {
    plugins = [plugins];
  }
  plugins.forEach(plg => {
    // ensure plugin is a function
    // or process would be exit
    if (!isFunc(plg)) {
      ins.logger.error(
        'init',
        'Plugins init error, plugin must be a function.\n' + 'Please check your plugin in wepy.config.js file'
      );
      throw new Error('EXIT');
    }
  });

  return plugins;
}

exports = module.exports = function(ins) {
  // system plugins
  [
    './../plugins/output/index',
    './../plugins/make/index',
    './../plugins/make/script',

    './../plugins/scriptDepFix',
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
    './../compile/loader/wepyLoader'
  ].map(v => require(v).call(ins));
  // check custom plugins
  const customPluginFns = checkPlugins(ins, ins.options.plugins);

  customPluginFns.map(fn => fn.call(ins));
};
