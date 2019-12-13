/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
// const sfcCompiler = require('vue-template-compiler');
// const fs = require('fs');
// const path = require('path');
// const loaderUtils = require('loader-utils');

const AppChain = require('../../../compile/chain').AppChain;

exports = module.exports = function() {
  this.register('parse-weapp', function(chain) {
    // config -> wxs -> template -> script -> styles
    return Promise.resolve(chain)
      .then(chain => {
        return this.hookUnique('make', chain.sfc.config, 'config');
      })
      .then(() => {
        if (chain.sfc.wxs) {
          return Promise.all(chain.sfc.wxs.map(wxsChain => this.hookUnique('make', wxsChain, 'wxs')));
        }
      })
      .then(() => {
        // TODO: ignore wxs
        if (chain instanceof AppChain) {
          return chain;
        }
        return this.hookUnique('make', chain.sfc.template, 'template');
      })
      .then(() => {
        return this.hookUnique('make', chain.sfc.script, 'script');
      })
      .then(() => {
        return Promise.all(chain.sfc.styles.map(styleChain => this.hookUnique('make', styleChain, 'style'))).then(
          () => chain
        );
      });

    /*
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
    */
  });
};
