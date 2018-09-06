/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const babel = require('babel-core');

exports = module.exports = function (options) {
  return function () {
    this.register('wepy-compiler-babel', function (node, file) {
      let p;
      try {
        let compiled = babel.transform(node.content, options);
        node.compiled = compiled;
        p = Promise.resolve(node);
      } catch (e) {
        this.hookUnqiue('error-handler', {
          type: 'error',
          title: 'babel',
          file: file,
          message: e.message,
          snapshot: e.codeFrame
        });
        p = Promise.reject(e);
      }
      return p;
    });
  }
}
