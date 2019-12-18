/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const path = require('path');

const Walker = require('../../ast/walker');
const toAst = require('../../ast/toAST');
const ScriptBead = require('../../compile/bead').ScriptBead;
const Chain = require('../../compile/chain').Chain;
const { ReplaceSource, RawSource } = require('../../compile/source');

// 记录 npm 文件是否已经遍历过
// const npmTraverseFileMap = {};

exports = module.exports = function() {
  this.register('parse-script-dep', function(chain, dep) {
    const bead = chain.bead;
    return this.resolvers.normal.resolve({ issuer: bead.path }, path.dirname(bead.path), dep.module, {}).then(rst => {
      // let assets = this.assets;
      let file = rst.path;

      if (!file) {
        // TODO: resovle fail ?
        return rst.path;
      }

      let depBead = this.producer.make(ScriptBead, file);
      const newChain = chain.createChain(depBead);

      // npm package file root is not context
      if (rst.meta.descriptionFileRoot !== this.context) {
        newChain.self('npm');
      }
      return this.hookUnique('make', newChain, 'script');
      /*
        if (fileHash === this.compiled[file].hash) {
          // File is not changed, do not compile again
          if (
            data.parser &&
            !data.depModules && // Ignore if deps modules are resolved, otherwise there will be a dead loop
            data.parser.deps &&
            data.parser.deps.length &&
            !npmTraverseFileMap[file]
          ) {
            // If it has dependences, walk throguh all dependences
            npmTraverseFileMap[file] = npm;
            let depTasks = data.parser.deps.map(dep =>
              this.hookUnique('wepy-parser-dep', data, this.compiled[file], dep)
            );
            return Promise.all(depTasks).then(rst => {
              data.depModules = rst;
              return data;
            });
          } else {
            return data;
          }
        } else {
          npmTraverseFileMap[file] = false;
        }
      }

      return this.hookUnique('wepy-parser-file', node, {
        file: file,
        npm: npm,
        component: ctx.component,
        type: ctx.type,
        dep,
        wxs: !!ctx.wxs
      });
      */
    });
  });

  this.register('parse-script', function(chain) {
    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }

    let source = new ReplaceSource(new RawSource(compiledCode));
    let astData = toAst(compiledCode);

    bead.parsed = {
      code: source,
      ast: astData,
      dependences: [],
      replaces: [],
      walker: new Walker(astData, chain)
    };
    bead.parsed.walker.run();

    let depTasks = bead.parsed.dependences.map(dep => this.hookUnique('parse-script-dep', chain, dep));
    return Promise.all(depTasks).then(chains => {
      chains.forEach(c => {
        if (chain.belong().npm || chain.self().npm) {
          this.producer.vendors(c);
        } else if (c.belong().npm || c.self().npm) {
          this.producer.vendors(c);
        } else {
          this.producer.assets(c);
        }
      });
      chain.setSeries(chains);
      return chain;
    });

    /*
    if (ctx.npm && !ctx.component && !ctx.wxs) {
      if (this.vendors.pending(ctx.file)) {
        // file compile is pending
        let moduleId = this.vendors.get(ctx.file);
        return Promise.resolve(moduleId);
      }
      ctx.vendorId = this.vendors.add(ctx.file, 'npm');
    }

    if (ctx.useCache && node.parsed) {
      // File is not changed
      let walker = node.parsed.parser;

      let depTasks = walker.deps.map(dep => this.hookUnique('wepy-parser-dep', node, ctx, dep));

      return Promise.all(depTasks).then(() => {
        return node.parsed;
      });
    } else {
      let source = new ReplaceSource(new RawSource(node.compiled.code));
      let astData = toAst(node.compiled.code);

      let walker = new Walker(this, astData, node.lang);
      walker.run();

      let depTasks = walker.deps.map(dep => this.hookUnique('wepy-parser-dep', node, ctx, dep));
      return Promise.all(depTasks).then(rst => {
        let obj = {
          file: ctx.file,
          parser: walker,
          code: node.compiled.code,
          encoding: node.compiled.encoding || 'utf-8',
          outputFileName: node.compiled.outputFileName,
          source: source,
          depModules: rst,
          npm: !!ctx.npm,
          type: ctx.type,
          component: ctx.component
        };

        this.fileDep.addDeps(ctx.file, obj.depModules.map(d => d.file));

        let componentValue = ctx.component;
        const t = this.assets.type(ctx.file);
        if (t !== undefined) {
          // if it has type in this.assets
          componentValue = t.component;
        }
        let types = {
          component: componentValue,
          npm: ctx.npm,
          dep: ctx.dep,
          type: ctx.type,
          wxs: ctx.wxs
        };

        this.assets.update(ctx.file, obj, types);
        obj.id = assets.get(ctx.file);
        if (ctx.npm && !(ctx.component && ctx.type === 'weapp') && !ctx.wxs) {
          this.vendors.update(ctx.file, obj, types);
          obj.vendorId = this.vendors.get(ctx.file);
        }
        return obj;
      });
    }
    */
  });
};
