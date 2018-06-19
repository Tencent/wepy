
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

const acorn = require('acorn-dynamic-import').default;
const Walker = require('../../ast/walker');
const toAst = require('../../ast/toAST');
const ReplaceSource = require('webpack-sources').ReplaceSource;
const RawSource = require('webpack-sources').RawSource;


const ECMA_VERSION = 2017;

const POSSIBLE_AST_OPTIONS = [{
  ranges: true,
  locations: true,
  ecmaVersion: ECMA_VERSION,
  sourceType: "module",
  plugins: {
    dynamicImport: true
  }
}, {
  ranges: true,
  locations: true,
  ecmaVersion: ECMA_VERSION,
  sourceType: "script",
  plugins: {
    dynamicImport: true
  }
}];

function ast (source) {
  let ast;
  const comments = [];
  for(let i = 0, len = POSSIBLE_AST_OPTIONS.length; i < len; i++) {
    if(!ast) {
      try {
        comments.length = 0;
        POSSIBLE_AST_OPTIONS[i].onComment = comments;
        ast = acorn.parse(source, POSSIBLE_AST_OPTIONS[i]);
      } catch(e) {
        // ignore the error
      }
    }
  }

  if (!ast) {
    ast = acorn.parse(source, {
      ranges: true,
      locations: true,
      ecmaVersion: ECMA_VERSION,
      sourceType: "module",
      plugins: {
        dynamicImport: true
      },
      onComment: comments
    });
  }

  if (!ast || typeof ast !== 'object') {
    throw new Error(`Source could\'t be parsed`);
  }
  return ast;
}

function parseDep (issuer, dep) {
  return this.compilation.resolvers.normal.resolve({issuer: issuer}, path.dirname(issuer), dep.module, {}).then(rst => {
    let npm = rst.meta.descriptionFileRoot !== this.compilation.context;
    let npmModules = this.compilation.npm;

    if (!rst.path) {
      return rst.path;
    }
    let id = npmModules.get(rst.path);
    if (id !== undefined) {
      return id;
    }


    let ext = path.extname(rst.path);

    if (ext === '.js') {
      if (npm) {
        return this.parse({
          code: fs.readFileSync(rst.path, 'utf-8')
        }, {
          file: rst.path,
          npm: npm
        });
      }
    } else if (ext === this.compilation.options.wpyExt) {
      return this.compilation.parsers.wpy.parse(rst.path);
    }
  }).catch(e => {
    console.error(e);
  });
}

exports = module.exports = function () {

  this.register('wepy-parser-dep', function (node, ctx, dep) {
    return this.resolvers.normal.resolve({issuer: ctx.file}, path.dirname(ctx.file), dep.module, {}).then(rst => {
      let npm = rst.meta.descriptionFileRoot !== this.context;
      let npmModules = this.npm;

      if (!rst.path) {
        return rst.path;
      }
      let id = npmModules.get(rst.path);
      if (id !== undefined) {
        return id;
      }

      let ext = path.extname(rst.path);

      if (ext === '.js') {
        if (npm) {
          return this.hookUnique('wepy-parser-script', {
            compiled: {
              code: fs.readFileSync(rst.path, 'utf-8')
            }
          }, {
            file: rst.path,
            npm: npm
          });
        }
      } else if (ext === this.options.wpyExt) {
        return this.parsers.wpy.parse(rst.path);
      }
    });
  });

  this.register('wepy-parser-script', function (node, ctx) {
    let npmModules = this.npm;
    if (ctx.npm) {
      if (npmModules.pending(ctx.file)) {
        return Promise.resolve(npmModules.get(ctx.file));
      }
      npmModules.add(ctx.file);
    }
    let source = new ReplaceSource(new RawSource(node.compiled.code));
    let astData = toAst(node.compiled.code);

    let walker = new Walker(astData);
    walker.run();

    let depTasks = [];

    walker.deps.forEach(dep => {
      depTasks.push(this.hookUnique('wepy-parser-dep', node, ctx, dep));
    });

    return Promise.all(depTasks).then(rst => {
      let obj = {
        file: ctx.file,
        parser: walker,
        code: node.compiled.code,
        source: source,
        depModules: rst
      };
      if (ctx.npm) {
        this.npm.update(ctx.file, obj);
        obj.id = npmModules.get(ctx.file);
      }
      return obj;
    });
  });
}
