/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const babel = require('@babel/core');
const path = require('path');

exports = module.exports = function (options) {
  return function () {
    this.register('wepy-compiler-babel', function (node, ctx) {
      let p;
      let file = typeof ctx === 'string' ? ctx : ctx.file;
      let outputFileName = path.basename(file, path.extname(file)) + '.js';
      if (node.src) {
        file = path.resolve(path.basename(file), node.src);
      }
      try {
        let compiled = babel.transform(node.content, {filename: file, ...options});
        node.compiled = compiled;
        if (path.extname(file) === '.ts') {
          compiled.outputFileName = outputFileName;
        }
        p = Promise.resolve(node);
      } catch (e) {
        this.hookUnique('error-handler', {
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


    this.register('prewalk-VariableDeclarator', function (walker, declarator, name, decl) {
      if (walker.lang !== 'babel')
        return;
      // var core_1 = _interopRequireDefault(require('@wepy/core'))
      if (declarator.init && declarator.init.type === 'CallExpression') {
        if (declarator.init.callee.name === '_interopRequireDefault') {
          let arg = declarator.init.arguments[0];
          if (arg && arg.type === 'CallExpression' && arg.callee.name === 'require' && arg.arguments[0].value === '@wepy/core') {
            walker.scope.instances.push(name + '.default');
          }
        }
      }
    });

    this.register('walker-detect-entry', function (walker, expression, exprName) {
      if (walker.lang !== 'babel')
        return;
      if (walker.scope.instances && walker.scope.instances.length && exprName) {
        if (exprName.callee === 'app' || exprName.callee === 'page' || exprName.callee === 'component') {
          if (walker.scope.instances.indexOf(exprName.instance) !== -1) {
            walker.entry = expression;
          }
        }
      }
    });
  }
}
