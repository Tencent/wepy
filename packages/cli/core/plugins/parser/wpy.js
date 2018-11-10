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
  this.register('wepy-parser-wpy', function (comp) {
    let sfc;
    let file = comp.path;
    let type = comp.type;
    if (!this.compiled[file]) {
      this.compiled[file] = {};
    }
    let wpyTask = [];
    if (!sfc) {
      this.involved[file] = 1;
      let entryContent = fs.readFileSync(file, 'utf-8');
      sfc = sfcCompiler.parseComponent(entryContent, { pad: 'line' });
      this.compiled[file].sfc = sfc;
      let context = {
        file: file,
        sfc: sfc,
        type: type,
        npm: type === 'module',
        component: true
      };

      // deal with the custom block, like config, wxs. etc.
      sfc = this.hookSeq('sfc-custom-block', sfc);

      if (!sfc.script) {
        sfc.script = {
          attrs: {},
          type: 'script',
          empty: true,
          content: 'Component({})'
        };
      }

      return this.hookAsyncSeq('pre-check-sfc', {
        node: sfc.config || { type: 'config', lang: 'json', content: '' },
        file: file
      }).then(rst => {
        return this.applyCompiler(rst.node, context);
      }).then(parsed => {
        sfc.config = sfc.config || {};
        sfc.config.parsed = parsed;

        if (sfc.wxs) {
          let p = sfc.wxs.map(wxs => {
            return this.hookAsyncSeq('pre-check-sfc', {
              node: wxs,
              file: file
            }).then(rst => {
              return this.applyCompiler(rst.node, context);
            });
          });
          return Promise.all(p);
        }
        return null;
      }).then((all = []) => {
        if (sfc.wxs && all && all.length) {
          all.forEach((parsed, i) => {
            sfc.wxs[i].parsed = parsed;
          });
        }
        return context;
      }).then(context => {
        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang = 'wxml';
          return this.hookAsyncSeq('pre-check-sfc', {
            node: sfc.template,
            file: file
          }).then(rst => {
            return this.applyCompiler(rst.node, context);
          })
        }
        return null;
      }).then(parsed => {
        sfc.config = sfc.config || {};
        sfc.template && (sfc.template.parsed = parsed);
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.hookAsyncSeq('pre-check-sfc', {
            node: sfc.script,
            file: file
          }).then(rst => {
            return this.applyCompiler(rst.node, context);
          });
        }
      }).then(parsed => {
        sfc.script && (sfc.script.parsed = parsed);

        let styleTask = [];
        if (sfc.styles) {
          let p = sfc.styles.map(style => {
            style.lang = style.lang || 'css';
            return this.hookAsyncSeq('pre-check-sfc', {
              node: style,
              file: file
            }).then(rst => {
              return this.applyCompiler(rst.node, context);
            });
          });

          return Promise.all(p);
        }
        return null;
      }).then((all = []) => {
        all.forEach((parsed, i) => {
          sfc.styles[i].parsed = parsed;
        }) ;
        return context;
      }).catch(e => {
        throw e;
      });
    } else {
      return Promise.reject('error component');
    }
  })
}
