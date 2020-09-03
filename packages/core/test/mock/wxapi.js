const fs = require('fs');
const path = require('path');

class MockWxAPI {
  constructor() {
    this._wx = {};
    this.init();
  }

  init() {
    const files = fs.readdirSync(path.join(__dirname, 'api'));
    files.forEach(file => {
      const api = file.replace('.js', '');
      this._wx[api] = require('./api/' + api);
    });
    return this;
  }

  mock(api, fn) {
    if (arguments.length === 2) {
      this._wx[api] = fn;
    }
    global.wx = this._wx;
    return this;
  }

  unmock(api) {
    if (api) {
      delete this._wx[api];
      global.wx = this._wx;
    } else {
      this._wx = {};
      delete global.wx;
    }
    return this;
  }
}

module.exports = MockWxAPI;
