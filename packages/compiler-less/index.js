/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const less = require('less');
const createPlugin = require('./createPlugin');

exports = module.exports = function(options) {
  return function() {
    this.register('wepy-compiler-less', function(node, ctx) {
      let config = Object.assign(
        {
          relativeUrls: true,
          plugins: []
        },
        options
      );
      let file = typeof ctx === 'string' ? ctx : ctx.file;
      config.filename = file;
      config.plugins.push(createPlugin(this));

      return less.render(node.content || '', config).then(rst => {
        node.compiled = {
          code: rst.css,
          dep: rst.imports
        };
        this.fileDep.addDeps(file, node.compiled.dep);
        return node;
      });
    });

    this.register('wepy-watch-file-changed-less', function(buildTask) {
      buildTask.files = this.fileDep.getSources(buildTask.changed);
      if (buildTask.files.includes(this.options.entry)) {
        buildTask.partial = false;
      }
      return buildTask;
    });
  };
};
