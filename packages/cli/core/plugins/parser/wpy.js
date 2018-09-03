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

const ENTRY_FILE = 'app.wpy';


exports = module.exports = function () {
  this.register('wepy-parser-wpy', function (file, type) {
    let sfc;
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
        sfc: sfc
      };
      let sfcConfig = sfc.customBlocks.filter(item => item.type === 'config');
      sfcConfig = sfcConfig.length ? sfcConfig[0] : { type: 'config', content: '' };
      sfcConfig.lang = sfcConfig.lang || 'json';
      sfc.config = sfcConfig;

      return this.hookAsyncSeq('pre-check-sfc', {
        node: sfcConfig,
        file: file
      }).then(rst => {
        return this.applyCompiler(rst.node, context);
      }).then(parsed => {
        sfc.config.parsed = parsed;

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
        this.logger.error(e);
      });

      return this.applyCompiler(this.checkSrc(sfcConfig, file), context).then(parsed => {
        sfc.config && (sfc.config.parsed = parsed);

        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang = 'wxml';
          return this.applyCompiler(this.checkSrc(sfc.template, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.template && (sfc.template.parsed = parsed);
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.applyCompiler(this.checkSrc(sfc.script, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.script && (sfc.script.parsed = parsed);
        let styleTask = [];
        if (sfc.styles) {
          sfc.styles.forEach(v => {
            v.lang = v.lang || 'css';
            styleTask.push(this.applyCompiler(this.checkSrc(v, file), context));
          })
        }
        return Promise.all(styleTask);
      }).then(parsed => {
        parsed.forEach((parsed, i) => {
          sfc.styles[i].parsed = parsed;
        });
        return context;
      }).catch(e => {
        console.error(e);
        debugger;
      });
      return this.applyCompiler(this.checkSrc(sfcConfig, file), context).then(parsed => {
        sfc.config && (sfc.config.parsed = parsed);

        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang = 'wxml';
          return this.applyCompiler(this.checkSrc(sfc.template, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.template && (sfc.template.parsed = parsed);
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.applyCompiler(this.checkSrc(sfc.script, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.script && (sfc.script.parsed = parsed);
        let styleTask = [];
        if (sfc.styles) {
          sfc.styles.forEach(v => {
            v.lang = v.lang || 'css';
            styleTask.push(this.applyCompiler(this.checkSrc(v, file), context));
          })
        }
        return Promise.all(styleTask);
      }).then(parsed => {
        parsed.forEach((parsed, i) => {
          sfc.styles[i].parsed = parsed;
        });
        return context;
      }).catch(e => {
        console.error(e);
        debugger;
      });

      return this.applyCompiler(this.checkSrc(sfcConfig, file), context).then(parsed => {
        sfc.config && (sfc.config.parsed = parsed);

        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang = 'wxml';
          return this.applyCompiler(this.checkSrc(sfc.template, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.template && (sfc.template.parsed = parsed);
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.applyCompiler(this.checkSrc(sfc.script, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.script && (sfc.script.parsed = parsed);
        let styleTask = [];
        if (sfc.styles) {
          sfc.styles.forEach(v => {
            v.lang = v.lang || 'css';
            styleTask.push(this.applyCompiler(this.checkSrc(v, file), context));
          })
        }
        return Promise.all(styleTask);
      }).then(parsed => {
        parsed.forEach((parsed, i) => {
          sfc.styles[i].parsed = parsed;
        });
        return context;
      }).catch(e => {
        console.error(e);
        debugger;
      });
    } else {
      return Promise.reject('error component');
    }
  })
}
