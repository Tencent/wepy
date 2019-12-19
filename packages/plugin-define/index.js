/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const stringifyObj = obj => {
  return (
    'Object({' +
    Object.keys(obj)
      .map(key => {
        const code = obj[key];
        return JSON.stringify(key) + ':' + toCode(code);
      })
      .join(',') +
    '})'
  );
};

/**
 * Convert code to a string that evaluates
 * @param {CodeValue} code Code to evaluate
 * @param {Parser} parser Parser
 * @returns {string} code converted to string that evaluates
 */
const toCode = code => {
  if (code === null) {
    return 'null';
  }
  if (code === undefined) {
    return 'undefined';
  }
  if (code instanceof RegExp && code.toString) {
    return code.toString();
  }
  if (typeof code === 'function' && code.toString) {
    return '(' + code.toString() + ')';
  }
  if (typeof code === 'object') {
    return stringifyObj(code);
  }
  return code + '';
};

function registerChainHook(chain, options) {
  chain.register('walker-unary-expression-undefined', function(parser, expr, names) {
    if (expr.operator === 'typeof') {
      let v = options[`typeof ${names.name}`] || options[`typeof(${names.name})`];
      if (v) {
        parser.replacements.push({ expr, value: toCode(v) });
      }
    }
    return [parser, expr, names];
  });
  chain.register('walker-member-expression-undefined', function(parser, expr, names) {
    if (options.hasOwnProperty(names.name)) {
      parser.replacements.push({ expr, value: toCode(options[names.name]) });
    }
    return [parser, expr, names];
  });
  chain.register('walker-identifier-undefined', function(parser, expr) {
    if (options.hasOwnProperty(expr.name)) {
      parser.replacements.push({ expr, value: toCode(options[expr.name]) });
    }
    return [parser, expr];
  });

  chain.__plugin_define_registed = true;
}

exports = module.exports = function DefinePlugin(options = {}) {
  return function() {
    this.register('before-parse-script', function(chain) {
      if (!chain.__plugin_define_registed) {
        registerChainHook(chain, options);
      }
      return Promise.resolve(chain);
    });
  };
};
