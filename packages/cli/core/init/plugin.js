exports = module.exports = function (ins) {

  let plugins = [
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

  ].map(v => require(v).call(ins));

  (ins.options.plugins || []).map(fn => fn.call(ins));

}
