const path = require('path');

const VENDOR_INJECTION = [
  `
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
})({
`,
  '',
  '});'
];

exports = module.exports = function() {
  this.register('build-vendor', function buildPages(vendor) {
    this.logger.info('vendor', 'building vendor');

    // VendorList is a chain list, do it may have duplicates beads.
    // So may need a hashmap to store the beads who were writen in vendor
    let writeBeads = {};
    let vendorList = this.producer.vendors();

    if (vendorList.length === 0) {
      // Empty vendor list.
      vendor.ignore = true;
      return vendor;
    }

    let code = '';

    vendorList.forEach(item => {
      if (!writeBeads[item.bead.id]) {
        this.hook('script-dep-fix', item);
        code += '/***** module ' + item.bead.no + ' start *****/\n';
        code += '/***** ' + item.bead.path + ' *****/\n';
        code += 'm' + item.bead.no + ': ' + 'function(module, exports, __wepy_require) {';
        code += item.bead.parsed.code.source() + '\n';
        code += '}';
        code += ',';
        code += '/***** module ' + item.bead.no + ' end *****/\n\n\n';
      }
      writeBeads[item.bead.id] = true;
    });

    let template = VENDOR_INJECTION.concat([]);
    template[1] = code;

    vendor.outputCode = template.join('');
    vendor.outputFile = path.join(this.context, this.options.target, 'vendor.js');

    return vendor;
  });
};
