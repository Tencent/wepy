/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const sfcCompiler = require('vue-template-compiler');
const fs = require('fs');
const path = require('path');

exports = module.exports = function () {
  this.register('wepy-parser-component', function (comp) {
    let parsedPath = path.parse(comp.path);
    let file = path.join(parsedPath.dir, parsedPath.name);
    let sfc = {
      styles: [],
      script: {},
      template: {}
    };
    let context = {
      sfc: sfc,
      file: file,
      npm: comp.npm,
      component: true,
      type: 'weapp', // This is a weapp original component
    };

    if (!this.compiled[file]) {
      this.compiled[file] = {};
    }
    let wpyTask = [];

    ['.js', '.wxml', 'wxss', '.json'].forEach(v => this.involved[file + v] = 1);

    let styleContent = '';
    if (fs.existsSync(file + '.wxss')) {  // If there is no wxss, then style is empty
      styleContent = fs.readFileSync(file + '.wxss', 'utf-8');
    }

    sfc.styles[0] = {
      content: styleContent,
      type: 'style',
      lang: 'wxss'
    };

    sfc.template = {
      content: fs.readFileSync(file + '.wxml', 'utf-8'),
      type: 'template',
      lang: 'wxml'
    };

    sfc.script = {
      content: fs.readFileSync(file + '.js', 'utf-8'),
      type: 'script',
      lang: 'babel'
    };

    sfc.config = {
      content: fs.readFileSync(file + '.json', 'utf-8'),
      type: 'config',
      lang: 'json'
    };

    return this.applyCompiler(sfc.config, context).then(parsed => {
      sfc.config.parsed = parsed;
    }).then(() => {
      return this.applyCompiler(sfc.template, context).then(parsed => {
        sfc.template.parsed = parsed;
      });
    }).then(() => {
      return this.applyCompiler(sfc.script, context).then(parsed => {
        sfc.script.parsed = parsed;
      });
    }).then(() => {
      return this.applyCompiler(sfc.styles[0], context).then(parsed => {
        sfc.styles[0].parsed = parsed;
      })
    }).then(() => context);
  });
}
