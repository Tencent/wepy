const path = require('path');


const VENDOR_INJECTION = [`
var window = { Number: Number, Array: Array, Date: Date, Error: Error, Math: Math, Object: Object, Function: Function, RegExp: RegExp, String: String, TypeError: TypeError, parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN };
var global = window;
var process = { env: {} };
(function(modules) {
   // The module cache
   var installedModules = {};
   // The require function
   function __wepy_require(moduleId) {
       // Check if module is in cache
       if(installedModules[moduleId])
           return installedModules[moduleId].exports;
       // Create a new module (and put it into the cache)
       var module = installedModules[moduleId] = {
           exports: {},
           id: moduleId,
           loaded: false
       };
       // Execute the module function
       modules[moduleId].call(module.exports, module, module.exports, __wepy_require);
       // Flag the module as loaded
       module.loaded = true;
       // Return the exports of the module
       return module.exports;
   }
   // expose the modules object (__webpack_modules__)
   __wepy_require.m = modules;
   // expose the module cache
   __wepy_require.c = installedModules;
   // __webpack_public_path__
   __wepy_require.p = "/";
   // Load entry module and return exports
   module.exports = __wepy_require;
   return __wepy_require;
})([
`,
  '',
  ']);'
];


exports = module.exports = function () {

  this.register('build-vendor', function buildPages (vendor) {

    this.logger.info('vendor', 'building vendor');

    let vendorList = this.vendors.array();
    let code = '';

    vendorList.forEach((item, i) => {
      let data = this.vendors.data(item);

      this.hook('script-dep-fix', data, true);

      code += '/***** module ' + i + ' start *****/\n';
      code += '/***** ' + data.file + ' *****/\n';
      code += 'function(module, exports, __wepy_require) {';
      code += data.source.source() + '\n';
      code += '}';
      if (i !== vendorList.length - 1) {
          code += ',';
      }
      code += '/***** module ' + i + ' end *****/\n\n\n';
    });

    let template = VENDOR_INJECTION.concat([]);
    template[1] = code;

    vendor.outputCode = template.join('');
    vendor.targetFile = path.join(this.context, this.options.target, 'vendor.js');

    return vendor;
  });
};

