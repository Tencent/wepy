/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const Module = require('module');
const path = require('path');
const logger = require('./util/logger');

let relativeModules = {};
let requiredModules = {};

let loadedPlugins = [];

class PluginHelper {
  constructor(plugins, op) {
    this.applyPlugin(0, op);
    return true;
  }
  applyPlugin(index, op) {
    let plg = loadedPlugins[index];

    if (!plg) {
      op.done && op.done(op);
    } else {
      op.next = () => {
        this.applyPlugin(index + 1, op);
      };
      op.catch = () => {
        op.error && op.error(op);
      };
      if (plg) plg.apply(op);
    }
  }
}

exports = module.exports = {
  attach(resolve) {
    this.resolve = resolve;
  },
  loadCompiler(lang) {
    if (['wxml', 'xml', 'css', 'js'].indexOf(lang) > -1) {
      return c => {
        return Promise.resolve(c);
      };
    }

    let name = 'wepy-compiler-' + lang;
    let compiler = this.load(name);

    if (!compiler) {
      this.missingNPM = name;
      logger.warn('loader', `Missing compiler: ${name}.`);
    }
    return compiler;
  },

  getNodeModulePath(loc, relative) {
    relative = relative || process.cwd();
    if (typeof Module === 'object') return null;

    let relativeMod = relativeModules[relative];
    let paths = [];

    if (!relativeMod) {
      relativeMod = new Module();

      let filename = path.join(relative, './');
      relativeMod.id = filename;
      relativeMod.filename = filename;
      relativeMod.paths = [].concat(this.resolve.modulePaths);

      paths = Module._nodeModulePaths(relative);
      relativeModules[relative] = relativeMod;
    }
    paths.forEach(v => {
      if (relativeMod.paths.indexOf(v) === -1) {
        relativeMod.paths.push(v);
      }
    });
    try {
      return Module._resolveFilename(loc, relativeMod);
    } catch (err) {
      return null;
    }
  },
  load(loc, relative) {
    if (requiredModules[loc]) return requiredModules[loc];

    let modulePath = this.getNodeModulePath(loc, relative);
    let m = null;
    try {
      m = require(modulePath);
    } catch (e) {
      // eslint-disable-next-line no-console
      if (e.message !== 'missing path') console.log(e);
    }
    if (m) {
      m = m.default ? m.default : m;
      requiredModules[loc] = m;
    }
    return m;
  },

  loadPlugin(plugins) {
    let plg, plgkey, setting;
    for (plgkey in plugins) {
      let name = 'wepy-plugin-' + plgkey;
      setting = plugins[plgkey];
      plg = this.load(name);

      if (!plg) {
        this.missingNPM = name;
        logger.warn('loader', `Missing plugin: ${name}`);
        return false;
      }
      loadedPlugins.push(new plg(setting));
    }
    return true;
  },
  PluginHelper: PluginHelper
};
