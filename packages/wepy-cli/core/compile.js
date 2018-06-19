/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const sfcCompiler = require('vue-template-compiler');
const fs = require('fs-extra');
const path = require('path');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");
const parseOptions = require('./parseOptions');
const moduleSet = require('./moduleSet');
const loader = require('./loader');
const logger = require('./util/logger');
const Hook = require('./hook');
const tag = require('./tag');
const walk = require("acorn/dist/walk");

const ENTRY_FILE = 'app.wpy';

const initHooks = function (vm, plugins) {
  if (typeof plugins === 'function')
    plugins = [plugins];

  plugins.forEach(plugin => plugin.call(vm));
};

class Compile extends Hook {
  constructor (opt) {
    super();
    let self = this;
    this.options = opt;
    this.options.entry = path.resolve(path.join(this.options.src, ENTRY_FILE));

    this.compiled = {};
    this.npm = new moduleSet();
    this.resolvers = {};

    this.context = process.cwd();

    let appConfig = opt.appConfig || {};
    let userDefinedTags = appConfig.tags || {};

    this.tags = {
      htmlTags: tag.combineTag(tag.HTML_TAGS, userDefinedTags.htmlTags),
      wxmlTags: tag.combineTag(tag.WXML_TAGS, userDefinedTags.wxmlTags),
      html2wxmlMap: tag.combineTagMap(tag.HTML2WXML_MAP, userDefinedTags.html2wxmlMap)
    };

    this.logger = logger;

    this.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);

    this.options.resolve.extensions = ['.js', '.json', '.node', '.wxs', this.options.wpyExt];

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
    ['wpy', 'script', 'style', 'template', 'config'].forEach(k => {
      let parser = k[0].toUpperCase() + k.slice(1);
      this.parsers[k] = require('./parse' + parser);
      this.parsers[k].compilation = this;
    });

    const styleHooker = (content, options, ctx) => {
      options.supportObject = true;
    };

    this.register('before-compiler-less', styleHooker);
    this.register('before-compiler-sass', styleHooker);
    this.register('before-compiler-stylus', styleHooker);

    let plugins = [
      './plugins/scriptDepFix',
      './plugins/scriptInjection',
      './plugins/build/app',
      './plugins/build/pages',
      './plugins/build/components',
      './plugins/build/vendor',

      './plugins/template/parse',
      './plugins/template/parseClassAndStyle',
    ].map(v => require(v));

    initHooks(this, plugins);

    ['output-app', 'output-pages', 'output-components'].forEach(k => {
      this.register(k, function (data) {
        if (!Array.isArray(data))
          data = [data];

        data.forEach(v => this.output(v));
      });
    });

    this.register('output-vendor', function (data) {
      fs.writeFileSync(data.targetFile, data.outputCode, 'utf-8');
    });
  }

  start () {

    this.parsers.wpy.parse(this.options.entry, 'app').then(app => {

      let sfc = app.sfc;
      let script = sfc.script;
      let styles = sfc.styles;
      let config = sfc.config;

      let appConfig = config.parsed;
      let pages = appConfig.pages.map(v => {
        return path.resolve(app.file, '..', v + this.options.wpyExt);
      });

      if (appConfig.subPackages) {
        appConfig.subPackages.forEach(sub => {
          pages.push(path.resolve(app.file, '..', sub + this.options.wpyExt));
        });
      }

      let tasks = pages.map(v => {
        return this.parsers.wpy.parse(v);
      });

      this.hookSeq('build-app', app);
      this.hookUnique('output-app', app);
      return Promise.all(tasks);
    }).then(pages => {

      this.hookSeq('build-pages', pages);
      this.hookUnique('output-pages', pages);

      let components = [];
      let tasks = [];

      pages.forEach(page => {
        let config = page.sfc.config || {};
        let parsed = config.parsed || {};
        let usingComponents = parsed.usingComponents || {};

        Object.keys(usingComponents).forEach(com => {
          components.push(path.resolve(page.file, '..', usingComponents[com] + this.options.wpyExt));
        });

        tasks = components.map(v => {
          return this.parsers.wpy.parse(v);
        });
      });

      return Promise.all(tasks);
    }).then(comps => {
      this.hookSeq('build-components', comps);
      this.hookUnique('output-components', comps);
    }).then(() => {
      let vendorData = this.hookSeq('build-vendor', {});
      this.hookUnique('output-vendor', vendorData);
    }).catch(e => {
      console.error(e);
    });


  }

  applyCompiler (sfcItem, ctx) {
    let compiler;
    if (sfcItem.lang) {
      let compilerOptions = this.options.compilers[sfcItem.lang] || [];
      if (['css', 'wxss', 'wxml', 'js', 'json'].indexOf(sfcItem.lang) > -1) {
        let parser = this.parsers[sfcItem.type];
        sfcItem.code = sfcItem.content;
        return parser.parse(sfcItem, ctx);
      }
      return this.resolvers.context.resolve({}, this.context, 'wepy-compiler-' + sfcItem.lang, {}).then(rst => {
        let compiler = require(rst.path).default;

        return compiler.apply(this, this.hookReturnOrigin('before-compiler-' + sfcItem.lang, sfcItem.content, compilerOptions, ctx.file)).then(rst => {
          let parser = this.parsers[sfcItem.type];
          return parser.parse.apply(parser, this.hookReturnOrigin('before-parser-' + sfcItem.type, rst, ctx));
        });
      }).catch(e => {
        console.error(e);
      });
    }
  }

  getTarget (file) {
    let relative = path.relative(path.join(this.context, this.options.src), file);
    let target = path.join(this.context, this.options.target, relative);
    return target;
  }

  output (item) {
    let sfc = item.sfc;
    let { script, styles, config, template } = sfc;

    const outputMap = {
      script: 'js',
      styles: 'wxss',
      config: 'json',
      template: 'wxml'
    };

    for (let k in outputMap) {
      if (sfc[k] && sfc[k].outputCode) {
        let filename = item.outputFile + '.' + outputMap[k];
        logger.silly('output', 'write file: ' + filename);
        fs.outputFile(filename, sfc[k].outputCode, function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  }
}




exports = module.exports = (program) => {
  let opt = parseOptions.convert(program);

  return new Compile(opt);
}
