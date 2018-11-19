/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


const eslint = require('eslint');
const formatter = require('eslint-friendly-formatter');

const cached = {};

exports = module.exports = function (options = {}) {
  const cwd = process.cwd();

  return function () {
    [
      'wxs',
      'config',
      'script',
      'template'
    ].forEach(type => {
      this.register('before-wepy-parser-' + type, function ({ node, ctx } = {}) {
        if (cached[ctx.file]) {
          return Promise.resolve({ node, ctx });
        }

        cached[ctx.file] = 1;
      
        options = Object.assign({}, {
          useEslintrc: true,
          extensions: ['.js', this.options.wpyExt || '.wpy']
        }, options);
  
        let file = ctx.file;
  
        if (!options.formatter) {
          options.formatter = formatter;
        }
  
        options.output = options.output === undefined ? true : options.output;
        
        const engine = new eslint.CLIEngine(options);
        const report = engine.executeOnFiles([ctx.file]);
        const rst = formatter(report.results);
        if (rst && options.output) {
          console.log(rst);
        }

        return Promise.resolve({ node, ctx });
      });
    })
  }
};
