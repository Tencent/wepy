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
const moduleSet = require('./moduleSet');
const loader = require('./loader');

const ENTRY_FILE = 'app.wpy';

class Compile {
  constructor (opt) {
    let self = this;
    this.options = opt;
    this.options.entry = path.resolve(path.join(this.options.src, ENTRY_FILE));

    this.compiled = {};
    this.npm = new moduleSet();
    this.resolvers = {};

    this.context = process.cwd();

    this.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);

    this.options.resolve.extensions = ['.js', '.json', '.node', this.options.wpyExt];

    this.resolvers.normal = ResolverFactory.createResolver(Object.assign({
      fileSystem: this.inputFileSystem
    }, this.options.resolve));

    this.resolvers.context = ResolverFactory.createResolver(Object.assign({
      fileSystem: this.inputFileSystem,
      resolveToContext: true
    }, this.options.resolve));


    let fnNormalBak = this.resolvers.normal.resolve;
    this.resolvers.normal.resolve = function (...args) {
      return new Promise((resolve, reject) => {
        args.push(function (err, filepath, meta) {
          if (err) {
            reject(err);
          } else {
            resolve({path: filepath, meta: meta});
          }
        });
        fnNormalBak.apply(self.resolvers.normal, args);
      });
    };
    let fnContextBak = this.resolvers.context.resolve;
    this.resolvers.context.resolve = function (...args) {
      return new Promise((resolve, reject) => {
        args.push(function (err, filepath, meta) {
          if (err) {
            reject(err);
          } else {
            resolve({path: filepath, meta: meta});
          }
        });
        fnContextBak.apply(self.resolvers.context, args);
      });
    };

    this.parsers = {};
    ['wpy', 'script', 'style', 'template'].forEach(k => {
      let parser = k[0].toUpperCase() + k.slice(1);
      this.parsers[k] = require('./parse' + parser);
      this.parsers[k].compilation = this;
    });

  }

  start () {

    this.parsers.wpy.parse(this.options.entry).then(rst => {
      let script = rst[0];
      let styles = rst[1];

      let appConfig = script.code.substring(script.parser.config.start, script.parser.config.end);
      try {
        appConfig = new Function('return ' + appConfig)();
      } catch (e) {
        throw 'error config';
      }
      debugger;
      let pages = appConfig.pages.map(v => {
        return path.resolve(path.join(this.options.src, v + this.options.wpyExt));
      });

      let tasks = pages.map(v => {
        return this.parsers.wpy.parse(v);
      });

      return Promise.all(tasks);
    }).then(res => {
      debugger;
    }).catch(e => {
      console.error(e);
    });


  }

  applyCompiler (sfcItem, ctx) {
    let compiler;
    if (sfcItem.lang) {
      let compilerOptions = this.options.compilers[sfcItem.lang] || [];
      if (['css', 'wxss', 'wxml', 'js'].indexOf(sfcItem.lang) > -1) {
        let parser = this.parsers[sfcItem.type];
        sfcItem.code = sfcItem.content;
        return parser.parse(sfcItem, ctx);
      }
      return this.resolvers.context.resolve({}, this.context, 'wepy-compiler-' + sfcItem.lang, {}).then(rst => {
        let compiler = require(rst.path).default;
        return compiler(sfcItem.content, compilerOptions, ctx.file).then(rst => {
          let parser = this.parsers[sfcItem.type];
          return parser.parse(rst, ctx);
        });
      }).catch(e => {
        console.error(e);
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
