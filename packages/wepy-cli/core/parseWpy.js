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
const parseOptions = require('./parseOptions');

const ENTRY_FILE = 'app.wpy';

exports = module.exports =  {

  parse (file, type) {
    let sfc;
    if (!this.compilation.compiled[file]) {
      this.compilation.compiled[file] = {};
    }
    let wpyTask = [];
    if (!sfc) {
      let entryContent = fs.readFileSync(file, 'utf-8');
      debugger;
      sfc = sfcCompiler.parseComponent(entryContent, { pad: 'line' });
      this.compilation.compiled[file].sfc = sfc;
      let context = {
        file: file,
        sfc: sfc
      };
      let sfcConfig = sfc.customBlocks.filter(item => item.type === 'config');
      sfcConfig = sfcConfig.length ? sfcConfig[0] : { type: 'config', content: '' };
      sfcConfig.lang = sfcConfig.lang || 'json';
      sfc.config = sfcConfig;

      return this.compilation.applyCompiler(this.checkSrc(sfcConfig, file), context).then(parsed => {
        sfc.config && (sfc.config.parsed = parsed);

        if (sfc.template && type !== 'app') {
          sfc.template.lang = sfc.template.lang = 'wxml';
          return this.compilation.applyCompiler(this.checkSrc(sfc.template, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.template && (sfc.template.parsed = parsed);
        if (sfc.script) {
          sfc.script.lang = sfc.script.lang || 'babel';
          return this.compilation.applyCompiler(this.checkSrc(sfc.script, file), context);
        }
        return null;
      }).then(parsed => {
        sfc.script && (sfc.script.parsed = parsed);
        let styleTask = [];
        if (sfc.styles) {
          sfc.styles.forEach(v => {
            v.lang = v.lang || 'css';
            styleTask.push(this.compilation.applyCompiler(this.checkSrc(v, file), context));
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
  },

  checkSrc (sfcItem, context) {
    if (sfcItem && sfcItem.src) {
      let srcPath = path.resolve(path.dirname(context), sfcItem.src);
      try {
        sfcItem.content = fs.readFileSync(srcPath, 'utf-8');
        sfcItem.dirty = true;
      } catch (e) {
        throw `Unable to open file "${sfcItem.src} in ${context}"`
      }
    }
   return sfcItem;
  }

}
