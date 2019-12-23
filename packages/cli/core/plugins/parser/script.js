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
const { ReplaceSource, RawSource } = require('../../compile/source');

exports = module.exports = function() {
  this.register('parse-script-dep', function(chain, dep) {
    chain = chain.sfc ? chain.sfc.script : chain;

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
    });
  });

  this.register('parse-script', function(chain) {
    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (!bead.parsed) {
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
    }

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
  });
};
