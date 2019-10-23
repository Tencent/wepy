/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const fs = require('fs');
const path = require('path');

const hashUtil = require('../../util/hash');

exports = module.exports = function() {
  this.register('wepy-parser-file', function(node, depFileCtx) {
    let file = depFileCtx.file;
    let fileContent = fs.readFileSync(file, 'utf-8');
    let fileHash = hashUtil.hash(fileContent);

    if (this.compiled[file] && fileHash === this.compiled[file].hash) {
      // 文件 hash 一致，说明文件无修改
      depFileCtx = this.compiled[file];
      depFileCtx.useCache = true;

      return Promise.resolve(depFileCtx);
    } else {
      this.compiled[file] = depFileCtx;
      depFileCtx.hash = fileHash;
      this.fileDep.cleanDeps(file);

      let ext = path.extname(file);

      let componentValue = ext === this.options.wpyExt;
      if (ext === '.js') {
        // if it is a weapp component, it must has a .wxml file
        const dirName = path.dirname(file);
        const baseName = path.basename(file, '.js');
        const wxmlFile = path.format({
          dir: dirName,
          base: baseName + '.wxml'
        });
        componentValue = fs.existsSync(wxmlFile);
      }

      this.assets.add(depFileCtx.file, {
        npm: depFileCtx.npm,
        dep: true,
        component: componentValue,
        type: depFileCtx.type,
        wxs: depFileCtx.wxs
      });

      if (ext === '.js' || ext === '.ts' || ext === '.wxs') {
        if (depFileCtx.npm && depFileCtx.type !== 'weapp') {
          // weapp component npm may have import in it.
          return this.applyCompiler({ type: 'script', lang: 'js', content: fileContent }, depFileCtx);
        } else {
          return this.applyCompiler({ type: 'script', lang: node.lang || 'babel', content: fileContent }, depFileCtx);
        }
      } else {
        if (ext === this.options.wpyExt) {
          // TODO: why they import a wpy file.
          this.hookUnique(
            'error-handler',
            'script',
            {
              code: node.compiled.code,
              ctx: depFileCtx,
              type: 'error',
              message: 'Can not import a wepy component, please use "usingComponents" to declear a component',
              title: 'dependence'
            },
            node.compiled.map
              ? {
                  sourcemap: node.compiled.map,
                  start: depFileCtx.dep.loc.start,
                  end: depFileCtx.dep.loc.end
                }
              : depFileCtx.dep.loc
          );
          throw new Error('EXIT');
        } else {
          this.hookUnique(
            'error-handler',
            'script',
            {
              code: node.compiled ? node.compiled.code : '',
              ctx: depFileCtx,
              type: 'error',
              message: `Unrecognized import extension: ${depFileCtx.file}`,
              title: 'dependence'
            },
            node.compiled && node.compiled.map
              ? {
                  sourcemap: node.compiled.map,
                  start: depFileCtx.dep.loc.start,
                  end: depFileCtx.dep.loc.end
                }
              : depFileCtx.dep.loc
          );
          throw new Error('EXIT');
        }
      }
    }
  });
};
