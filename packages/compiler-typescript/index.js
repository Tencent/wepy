/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const path = require('path');
const ts = require('typescript');

function registerChainHook(chain) {
  // eslint-disable-next-line
  chain.register('prewalk-VariableDeclarator', function(walker, declarator, name, decl) {
    // var core_1 = __importDefault(require('@wepy/core'))
    if (declarator.init && declarator.init.type === 'CallExpression') {
      if (declarator.init.callee.name === '__importDefault') {
        let arg = declarator.init.arguments[0];
        if (
          arg &&
          arg.type === 'CallExpression' &&
          arg.callee.name === 'require' &&
          arg.arguments[0].value === '@wepy/core'
        ) {
          walker.scope.instances.push(name + '.default');
        }
      }
      /*
       * var core_1 = require('@wepy/core');
      if (declarator.init.callee.name === 'require') {
        if (declarator.init.arguments && declarator.init.arguments[0] && declarator.init.arguments[0].value === '@wepy/core') {
          walker.scope.instances.push(name + '.default');
        }
      }*/
    }
  });

  chain.register('walker-detect-entry', function(walker, expression, exprName) {
    if (walker.scope.instances && walker.scope.instances.length && exprName) {
      if (exprName.callee === 'app' || exprName.callee === 'page' || exprName.callee === 'component') {
        if (walker.scope.instances.indexOf(exprName.instance) !== -1) {
          walker.entry = expression;
        }
      }
    }
  });
  registerChainHook.registed = true;
  return chain;
}
exports = module.exports = function(options) {
  return function() {
    this.register('wepy-compiler-typescript', function(chain) {
      if (!registerChainHook.registed) {
        registerChainHook(chain);
      }
      let p;
      const bead = chain.bead;
      const file = bead.path;
      let params = Object.assign(
        {},
        {
          fileName: file,
          compilerOptions: {
            esModuleInterop: true,
            module: ts.ModuleKind.CommonJS
          }
        },
        options
      );
      try {
        let compiled = ts.transpileModule(bead.content, params);
        compiled.code = compiled.outputText;
        let fileObj = path.parse(file);
        delete compiled.outputText;
        bead.compiled = compiled;

        compiled.outputFileName = fileObj.name + '.js';
        p = Promise.resolve(chain);
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
  };
};
