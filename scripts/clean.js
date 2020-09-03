const rimraf = require('rimraf');

console.log('Clear all dependencies');

rimraf.sync('node_modules');
rimraf.sync('yarn.lock');
rimraf.sync('package-lock.json');
rimraf.sync('packages/*/node_modules');
rimraf.sync('packages/*/yarn.lock');
rimraf.sync('packages/*/package-lock.json');
