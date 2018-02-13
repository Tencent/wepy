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

  parse (file) {
    let sfc;
    if (!this.compilation.compiled[file]) {
      this.compilation.compiled[file] = {};
    }
    this.file = file;
    let wpyTask = [];
    if (!sfc) {
      let entryContent = fs.readFileSync(file, 'utf-8');
      sfc = sfcCompiler.parseComponent(entryContent, { pad: 'line' });
      this.compilation.compiled[file].sfc = sfc;
      let context = {
        file: file,
        sfc: sfc
      };
      if (sfc.script) {
        wpyTask.push(this.compilation.applyCompiler(this.checkSrc(sfc.script), context));
      }
      if (sfc.styles) {
        let styleTask = [];
        sfc.styles.forEach(v => {
          styleTask.push(this.compilation.applyCompiler(this.checkSrc(v), context));
        });
        wpyTask.push(Promise.all(styleTask));
      }
      if (sfc.template) {
        wpyTask.push(his.compilation.applyCompiler(this.checkSrc(sfc.template), context));
      }
    }
    return wpyTask.length ? Promise.all(wpyTask) : Promise.resolve(null);
  },

  checkSrc (sfcItem) {
    if (sfcItem && sfcItem.src) {
      let srcPath = path.resolve(path.dirname(this.file), sfcItem.src);
      try {
        sfcItem.content = fs.readFileSync(srcPath, 'utf-8');
        sfcItem.dirty = true;
      } catch (e) {
        throw `Unable to open file "${sfcItem.src} in ${this.file}"`
      }
    }
   return sfcItem;
  }

}
