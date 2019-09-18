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
const CONST = require('../../util/const')

const wxmlAst = require('../../ast/wxml');


const readFile = (file, defaultValue = '') => {
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf-8');
  }
  return defaultValue;
};

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
    let weappCacheKey = file + CONST.WEAPP_EXT;

    if (!this.compiled[weappCacheKey]) {
      this.compiled[weappCacheKey] = comp;
    }

    this.fileDep.addDeps(weappCacheKey);

    sfc.styles[0] = {
      content: readFile(file + '.wxss'),
      type: 'style',
      lang: 'wxss'
    };

    sfc.template = {
      content: readFile(file + '.wxml'),
      type: 'template',
      lang: 'wxml'
    };

    // JS file should be there.
    sfc.script = {
      content: readFile(file + '.js', 'Page({})'),
      type: 'script',
      lang: 'babel'
    };

    sfc.config = {
      content: readFile(file + '.json', '{}'),
      type: 'config',
      lang: 'json'
    };

    let flow = Promise.resolve(true);
    let templateContent = sfc.template.content;

    if (templateContent.indexOf('<wxs ') > -1) { // wxs tag inside
      let templateAst = wxmlAst(sfc.template.content);

      sfc.wxs = [];

      flow = templateAst.then(ast => {
        let checkSrc = false;
        wxmlAst.walk(ast, {
          name: {
            wxs (item) {
              if (item.type === 'tag' && item.name === 'wxs') {
                if (item.attribs.src) {
                  checkSrc = true;
                }
                sfc.wxs.push({
                  attrs: item.attribs,
                  src: checkSrc ? item.attribs.src : '',
                  lang: 'js',
                  type: 'wxs',
                  content: wxmlAst.generate(item.children)
                });
                // Remove node;
                item.data = '';
                item.children = [];
                item.type = 'text';
              }
            }
          }
        });
        if (checkSrc) {  // has wxs with src, reset wxml
          sfc.template.content = wxmlAst.generate(ast);
        }
        return checkSrc ? this.hookAsyncSeq('parse-sfc-src', context) : true;
      });
    }


    return flow.then(() => {
      if (sfc.wxs) {
        return Promise.all(sfc.wxs.map(wxs => {
          return this.applyCompiler(wxs, context);
        }));
      }
    }).then(() => {
      return this.applyCompiler(sfc.config, context);
    }).then(() => {
      return this.applyCompiler(sfc.template, context);
    }).then(() => {
      return this.applyCompiler(sfc.script, context);
    }).then((parsed) => {
      sfc.script.parsed = parsed;
      return this.applyCompiler(sfc.styles[0], context);
    }).then(() => context);

  });
};
