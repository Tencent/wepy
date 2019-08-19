/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


const stylus = require('stylus');
const createPlugin = require('./createPlugin');

exports = module.exports = function (options) {
  return function () {

    this.register('wepy-compiler-stylus', function (node, ctx) {

      let file = typeof ctx === 'string' ? ctx : ctx.file;
      const plugins = createPlugin(this)
      let config = Object.assign({
        use: plugins,
        filename: file
      }, options);
      const styl = stylus(node.content || '', config)

      return new Promise((resolve, reject) => {
        styl.render(function(err, css) {
          if (err) reject(err)
          else {
            node.compiled = {
              code: css,
              dep: styl.deps()
            };
            resolve(node);
          }
        })
      })
    });
  }
}
