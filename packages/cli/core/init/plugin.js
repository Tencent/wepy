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
    './../plugins/template/parseClassAndStyle',

    './../plugins/template/directives/v-model',
    './../plugins/template/directives/v-on',


    './../plugins/helper/supportSrc',

    './../plugins/compiler/index',

  ].map(v => require(v).call(ins));

}
