/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const objectHash = require('object-hash');

const cached = {};
const engines = {};

function lint(engine, file) {
  return engine.executeOnFiles(file);
}

function printLinterOutput (res, options) {
  if (res.warningCount && options.quiet) {
    res.warningCount = 0;
    res.results.forEach(item => {
      item.warningCount = 0;
      item.messages = item.messages.filter(message => message.severity !== 1);
    });
  }

  // if enabled, use eslint auto-fixing where possible
  if (options.fix && (res.fixableErrorCount > 0 || res.fixableWarningCount)) {
    const eslint = require(options.eslintPath);
    eslint.CLIEngine.outputFixes(res);
  }
  // removed file ignore warning
  res.results.forEach(item => {
    item.messages = item.messages.filter(msg => msg.message.indexOf('File ignored') === -1);
  });

  if (res.errorCount || res.warningCount) {
    const fmt = options.formatter(res.results);

    if (fmt && options.output) {
      console.log(fmt);
    }
  }
}

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
          eslintPath: 'eslint',
          quiet: false,
          output: true,
          extensions: ['.js', this.options.wpyExt || '.wpy']
        }, options);

        // Create singleton engine per config
        const optionsHash = objectHash(options);
        if (!engines[optionsHash]) {
          const eslint = require(options.eslintPath);
          engines[optionsHash] = new eslint.CLIEngine(options);
        }

        // Create eslint formatter
        if (typeof options.formatter === 'string') {
          try {
            options.formatter = require(options.formatter);

            if (
              options.formatter &&
              typeof options.formatter !== 'function' &&
              typeof options.formatter.default === 'function'
            ) {
              options.formatter = options.formatter.default;
            }
          } catch (_) {
            // ignore
          }
        }

        if (
          !options.formatter ||
          typeof options.formatter !== 'function'
        ) {
          const userEslintPath = options.eslintPath;
          if (userEslintPath) {
            try {
              options.formatter = require(userEslintPath + '/lib/formatters/stylish');
            } catch (e) {
              options.formatter = require('eslint/lib/formatters/stylish');
            }
          } else {
            options.formatter = require('eslint/lib/formatters/stylish');
          }
        }

        const engine = engines[optionsHash];

        printLinterOutput(lint(engine, [ctx.file]), options);

        return Promise.resolve({ node, ctx });
      });
    })
  }
};
