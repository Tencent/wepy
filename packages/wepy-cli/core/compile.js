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
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");
const parseOptions = require('./parseOptions');
const loader = require('./loader');

const ENTRY_FILE = 'app.wpy';

class Compile {
  constructor (opt) {
    this.options = opt;
    this.options.entry = path.resolve(path.join(this.options.src, ENTRY_FILE));

    this.compiled = {};

    this.resolvers = {};

    this.context = process.cwd();

    this.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);

    this.resolvers.normal = ResolverFactory.createResolver(Object.assign({
      fileSystem: this.inputFileSystem
    }, this.options.resolve));

    this.resolvers.context = ResolverFactory.createResolver(Object.assign({
      fileSystem: this.inputFileSystem,
      resolveToContext: true
    }, this.options.resolve));

    this.parsers = {};
    ['wpy', 'script', 'style', 'template'].forEach(k => {
      let parser = k[0].toUpperCase() + k.slice(1);
      this.parsers[k] = require('./parse' + parser);
      this.parsers[k].compilation = this;
    });

  }

  start () {

    this.parsers.wpy.parse(this.options.entry);


  }

  applyCompiler (sfcItem, ctx) {
    let compiler;
    if (sfcItem.lang) {

      let compilerOptions = this.options.compilers[sfcItem.lang] || [];

      return new Promise((resolve, reject) => {
        this.resolvers.context.resolve({}, this.context, 'wepy-compiler-' + sfcItem.lang, {}, (err, filepath) => {
          if (err) {
            reject(err);
            return;
          }
          let compiler = require(filepath).default;
          return compiler(sfcItem.content, compilerOptions, ctx.file).then(rst => {
            let parser = this.parsers[sfcItem.type];
            return parser.parse(rst, ctx);
          });
        });
      });
    }
  }

  loadCompiler (type) {

    this.resolvers.normal.resolve({}, this.context, './compile-' + type, function () {

      debugger;
    })
    this.resolvers.normal.resolve({}, this.context, 'wepy', function () {

      debugger;
    })
    this.resolvers.context.resolve({}, this.context, 'wepy', function () {

      debugger;
    });
    // let compiler = require('./compile-' + type);
    // compiler.compilation = this;
    // return compiler;
  }
}


exports = module.exports = (program) => {
  let opt = parseOptions.convert(program);

  return new Compile(opt);
}
