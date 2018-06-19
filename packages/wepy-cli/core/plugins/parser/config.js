exports = module.exports = function () {
  this.register('wepy-parser-config', function (rst) {
    let configString = rst.content.replace(/^\n*/, '').replace(/\n*$/, '');
    configString = configString || '{}';
    let config = null;
    try {
      let fn = new Function('return ' + configString);
      config = fn();
    } catch (e) {
      return Promise.reject(`invalid json: ${configString}`);
    }
    return Promise.resolve(config);
  });
}
