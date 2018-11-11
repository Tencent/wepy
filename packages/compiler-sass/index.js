/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const os = require('os');
const path = require('path');
const sass = require('node-sass');
const resolveImporter = require('./resolveImporter');

function createSassPlugin (compilation, type, options) {
  return function (node, ctx) {
    let file = typeof ctx === 'string' ? ctx : ctx.file;
    let config = Object.assign({
      file: file
    }, options);

    config.data = config.data ? (config.data + os.EOL + node.content) : node.content;

    config.importer = config.importer || [];
    config.importer.push(resolveImporter(compilation, file));

    config.includePaths = config.includePaths || [];
    config.includePaths.push(path.dirname(file));

    if (type === 'sass' && 'indentedSyntax' in config === false) {
      config.indentedSyntax = true;
    } else {
      config.indentedSyntax = Boolean(config.indentedSyntax);
    }

    return new Promise ((resolve, reject) => {
      sass.render(config, (err, res) => {
        if (err) {
          reject(err);
        } else {
          node.compiled = {
            code: res.css.toString()
          }
          resolve(node);
        }
      });
    });
  }
}

exports = module.exports = function (options) {
  return function () {
    ['sass', 'scss'].forEach(type => {
      this.register(`wepy-compiler-${type}`, createSassPlugin(this, type, options));
    });
  }
}
