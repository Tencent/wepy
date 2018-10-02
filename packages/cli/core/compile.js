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
const chokidar = require('chokidar');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const node = require("enhanced-resolve/lib/node");
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");
const parseOptions = require('./parseOptions');
const moduleSet = require('./moduleSet');
const loader = require('./loader');
const logger = require('./util/logger');
const VENDOR_DIR = require('./util/const').VENDOR_DIR;
const Hook = require('./hook');
const tag = require('./tag');
const walk = require("acorn/dist/walk");

const initCompiler = require('./init/compiler');
const initParser = require('./init/parser');
const initPlugin = require('./init/plugin');

class Compile extends Hook {
  constructor (opt) {
    super();
    let self = this;

    this.version = require('../package.json').version;
    this.options = opt;

    if (!path.isAbsolute(opt.entry)) {
      this.options.entry = path.resolve(path.join(opt.src, opt.entry));
    }
    
    this.clear();
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

    this.resolvers.normal.resolveSync = node.create.sync(Object.assign({
      fileSystem: this.inputFileSystem
    }, this.options.resolve))

    this.resolvers.context.resolveSync = node.create.sync(Object.assign({
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


  }

  clear () {
    this.compiled = {};
    this.involved = {};
    this.vendors = new moduleSet();
    this.assets = new moduleSet();
    return this;
  }

  init () {
    const styleHooker = (content, options, ctx) => {
      options.supportObject = true;
    };

    this.register('before-compiler-less', styleHooker);
    this.register('before-compiler-sass', styleHooker);
    this.register('before-compiler-stylus', styleHooker);

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

    this.register('output-assets', function (list) {
      list.forEach(file => {
        fs.outputFile(file.targetFile, file.outputCode, file.encoding || 'utf-8');
      });
    });

    this.register('output-static', function () {
      let paths = this.options.static;
      let copy = (p) => {
        let relative = path.relative(path.join(this.context, this.options.src), path.join(this.context, p));
        fs.copy(path.join(this.context, p), path.join(this.context, this.options.target, relative[0] === '.' ? p : relative));
      }
      if (typeof paths === 'string')
        copy(paths);
      else if (Array.isArray(paths))
        paths.forEach(copy);
    });

    initPlugin(this);
    initParser(this);

    return initCompiler(this, this.options.compilers);
  }

  start () {

    this.hookUnique('wepy-parser-wpy', this.options.entry, 'app').then(app => {

      let sfc = app.sfc;
      let script = sfc.script;
      let styles = sfc.styles;
      let config = sfc.config;

      let appConfig = config.parsed.output;
      if (!appConfig.pages || appConfig.pages.length === 0) {

        this.hookUnique('error-handler', {
          type: 'error',
          ctx: app,
          message: `Missing "pages" in App config`
        });

        throw new Error('EXIT');
      }
      let pages = appConfig.pages.map(v => {
        return path.resolve(app.file, '..', v + this.options.wpyExt);
      });

      if (appConfig.subPackages) {
        appConfig.subPackages.forEach(sub => {
           sub.pages.forEach(v => {
            pages.push(path.resolve(app.file, '../'+sub.root || '', v + this.options.wpyExt));
          });

        });
      }

      let tasks = pages.map(v => {
        return this.hookUnique('wepy-parser-wpy', v);
      });

      this.hookSeq('build-app', app);
      this.hookUnique('output-app', app);
      return Promise.all(tasks);
    }).then(comps => {

      function buildComponents (comps) {
        if (!comps) {
          return null;
        }

        this.hookSeq('build-components', comps);
        this.hookUnique('output-components', comps);

        let components = [];
        let originalComponents = [];
        let tasks = [];

        comps.forEach(comp => {
          let config = comp.sfc.config || {};
          let parsed = config.parsed || {};
          let parsedComponents = parsed.components || [];

          parsedComponents.forEach(com => {
            if (com.type === 'wepy') { // wepy 组件
              tasks.push(this.hookUnique('wepy-parser-wpy', com.source, com.prefix === 'module' ? 'module' : 'normal'));
            } else if (com.type === 'weapp') { // 原生组件
              tasks.push(this.hookUnique('wepy-parser-component', com.source, com.prefix === 'module' ? 'module' : 'normal'));
            }
          });
        });

        if (tasks.length) {
          return Promise.all(tasks).then(buildComponents.bind(this));
        } else {
          return null;
        }
      }
      return buildComponents.bind(this)(comps);
    }).then(() => {
      let vendorData = this.hookSeq('build-vendor', {});
      this.hookUnique('output-vendor', vendorData);
    }).then(() => {
      let assetsData = this.hookSeq('build-assets');
      this.hookUnique('output-assets', assetsData);
    }).then(() => {
      this.hookUnique('output-static')
    }).then(() => {
      this.logger.info('process finished');
      if (this.options.watch) {
        this.logger.info('watching...');
        this.watch();
      }
    }).catch(e => {
      if (e.message !== 'EXIT') {
        this.logger.error(e);
      }
      if (this.logger.level() !== 'trace') {
        this.logger.error('compile', 'Compile failed. Add "--log trace" to see more details');
      } else {
        this.logger.error('compile', 'Compile failed.');
      }
      if (this.options.watch) {
        this.logger.info('watching...');
        this.watch();
      }
    });
  }

  watch () {
    if (this.watchInitialized) {
      return;
    }
    this.watchInitialized = true;
    let watchOption = Object.assign({ ignoreInitial: true }, this.options.watchOption || {});
    let target = path.resolve(this.context, this.options.target);

    if (!watchOption.ignore) {
      let type = Object.prototype.toString.call(watchOption.ignore);
      if (type === '[object String]' || type === '[object RegExp]') {
        watchOption.ignored = [watchOption.ignored];
        watchOption.ignored.push(this.options.target);
      } else if (type === '[object Array]') {
        watchOption.ignored.push(this.options.target);
      }
    }

    chokidar.watch(['.', '!./weapp'], watchOption).on('all', (evt, filepath) => {
      if (evt === 'change') {
        let absolutePath = path.resolve(filepath);
        if (this.involved[absolutePath]) {
          this.logger.silly('watch', `Watcher triggered by file changes: ${absolutePath}`);
          this.clear().start();
        }
      }
    })
  }

  applyCompiler (node, ctx) {
    let compiler;
    if (node.lang) {
      let compilerOptions = this.options.compilers[node.lang] || [];

      /*
      if (['css', 'wxss', 'wxml', 'js', 'json'].indexOf(node.lang) > -1) {
        let parser = this.parsers[node.type];
        node.code = node.content;
        return parser.parse(node, ctx);
      }*/

      let hookKey = 'wepy-compiler-' + node.lang;

      if (!this.hasHook(hookKey)) {
        throw `Missing plugins ${hookKey}`;
      }

      this.involved[ctx.file] = 1;
      return this.hookUnique(hookKey, node, ctx.file).then(node => {
        return this.hookUnique('wepy-parser-' + node.type, node, ctx);
      });
    }
  }

  getTarget (file, targetDir) {
    let relative = path.relative(path.join(this.context, this.options.src), file);
    let targetFile = path.join(this.context, targetDir || this.options.target, relative);
    return targetFile;
  }

  getModuleTarget (file, targetDir) {
    let relative = path.relative(this.context, file);
    let dirs = relative.split(path.sep);
    dirs.shift();  // shift node_modules
    relative = dirs.join(path.sep);
    let targetFile = path.join(this.context, targetDir || this.options.target, VENDOR_DIR, relative);
    return targetFile;
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
