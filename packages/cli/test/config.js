const path = require('path');

const resolve = dir => path.join(__dirname, '..', dir);

exports.alias = {
  'core': resolve('core'),
  'ast': resolve('core/ast'),
  'init': resolve('core/init'),
  'plugins': resolve('core/plugins'),
  'util': resolve('core/util')  
}