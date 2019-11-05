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
const loaderUtils = require('loader-utils');
const AppChain = require('../../compile/AppChain');
const Chain = require('../../compile/Chain');

exports = module.exports = function() {
  this.register('wepy-parser-wpy', function(chain) {
    const bead = chain.bead;

    // config -> wxs -> template -> script -> styles
    return this.hookUnique('wepy-loader-wpy', bead)
      .then(bead => {
        const newChain = new Chain(bead.sfc.config);
        newChain.setPrevious(chain);
        return this.compileAndParse('config', newChain);
      })
      .then(() => {
        // TODO: ignore wxs
        if (chain instanceof AppChain) {
          return chain;
        }
        const newChain = new Chain(bead.sfc.template);
        newChain.setPrevious(chain);
        return this.compileAndParse('template', newChain);
      })
      .then(() => {
        const newChain = new Chain(bead.sfc.script);
        newChain.setPrevious(chain);
        return this.compileAndParse('script', newChain);
      })
      .then(() => {
        return Promise.all(
          chain.bead.sfc.styles.map(styleBead => {
            const newChain = new Chain(styleBead);
            newChain.setPrevious(chain);
            return this.compileAndParse('style', newChain);
          })
        ).then(() => chain);
      });

    if (this.compiled[file] && fileHash === this.compiled[file].hash) {
      // 文件 hash 一致，说明文件无修改
      context = this.compiled[file];
      context.useCache = true;
      sfc = context.sfc;

      if (context.done) {
        flow = Promise.resolve(true); // For file watch, still need to go throught all the dependences
      } else {
        flow = context.promise;
      }
    } else {
      this.compiled[file] = context;
      context.useCache = false;
      context.hash = fileHash;
      this.fileDep.cleanDeps(file);

      context.sfc = sfcCompiler.parseComponent(fileContent, { pad: 'space' });

      sfc = context.sfc;
      // deal with the custom block, like config, wxs. etc.
      sfc = this.hookSeq('sfc-custom-block', sfc);

      if (!sfc.script) {
        sfc.script = {
          attrs: {},
          type: 'script',
          empty: true,
          lang: 'js',
          content: 'Component({})'
        };
      }

      if (!sfc.config) {
        sfc.config = { type: 'config', empty: true, content: '{}', lang: 'json' };
      }

      flow = this.hookAsyncSeq('parse-sfc-src', context);
    }

    this.fileDep.addDeps(file);

    context.promise = flow
      .then(() => {
        return this.applyCompiler(context.sfc.config, context);
      })
      .then(() => {
        if (sfc.wxs) {
          return Promise.all(
            sfc.wxs.map(wxs => {
              return this.applyCompiler(wxs, context);
            })
          );
        }
      })
      .then(() => {
        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang || 'wxml';
          return this.applyCompiler(context.sfc.template, context);
        }
      })
      .then(() => {
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.applyCompiler(context.sfc.script, context);
        }
      })
      .then(parsed => {
        sfc.script && parsed && (sfc.script.parsed = parsed);
        if (sfc.styles) {
          return Promise.all(
            sfc.styles.map(style => {
              style.lang = style.lang || 'css';
              return this.applyCompiler(style, context);
            })
          );
        }
      })
      .then(() => {
        context.done = true;
        return context;
      });

    return context.promise;
  });

  const trailingSlash = /[/\\]$/;

  this.register('parse-sfc-src', function(context) {
    let sfc = context.sfc;

    let tasks = [];
    let dir = path.parse(context.file).dir;
    dir = dir.replace(trailingSlash, '');

    for (let type in sfc) {
      // wxs is an array.
      let nodes = [].concat(sfc[type]);
      nodes.forEach(node => {
        const src = node ? node.src : '';
        if (src) {
          const request = loaderUtils.urlToRequest(src, src.charAt(0) === '/' ? '' : null);
          tasks.push(
            this.resolvers.normal.resolve({}, dir, request, {}).then(rst => {
              node.content = fs.readFileSync(rst.path, 'utf-8');
              this.fileDep.addDeps(context.file, [rst.path]);
              node.dirty = true;
            })
          );
        }
      });
    }
    return Promise.all(tasks);
  });
};
