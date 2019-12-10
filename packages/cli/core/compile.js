/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const node = require('enhanced-resolve/lib/node');
const NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
const parseOptions = require('./parseOptions');
const moduleSet = require('./moduleSet');
const CacheFile = require('./CacheFile');
const fileDep = require('./fileDep');
const logger = require('./util/logger');
const VENDOR_DIR = require('./util/const').VENDOR_DIR;
const Hook = require('./hook');
const tag = require('./tag');
const extTransform = require('./util/extTransform');
const { debounce } = require('throttle-debounce');

const initCompiler = require('./init/compiler');
const initParser = require('./init/parser');
const initPlugin = require('./init/plugin');

//const Chain = require('./compile/Chain');
const { AppChain, PageChain, ComponentChain } = require('./compile/chain');
const { WepyBead, ScriptBead } = require('./compile/bead');
const Producer = require('./Producer');

class Compile extends Hook {
  constructor(opt) {
    super();
    let self = this;

    this.version = require('../package.json').version;
    this.options = opt;

    if (!path.isAbsolute(opt.entry)) {
      this.options.entry = path.resolve(path.join(opt.src, opt.entry + opt.wpyExt));
    }

    this.resolvers = {};
    this.running = false;

    this.context = process.cwd();

    let appConfig = opt.appConfig || {};
    let userDefinedTags = appConfig.tags || {};

    this.tags = {
      htmlTags: tag.combineTag(tag.HTML_TAGS, userDefinedTags.htmlTags),
      wxmlTags: tag.combineTag(tag.WXML_TAGS, userDefinedTags.wxmlTags),
      html2wxmlMap: tag.combineTagMap(tag.HTML2WXML_MAP, userDefinedTags.html2wxmlMap)
    };

    this.logger = logger;

    this.cache = new CacheFile();
    this.producer = new Producer();

    this.inputFileSystem = new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000);

    this.options.resolve.extensions = ['.js', '.ts', '.json', '.node', '.wxs', this.options.wpyExt];

    this.resolvers.normal = ResolverFactory.createResolver(
      Object.assign(
        {
          fileSystem: this.inputFileSystem
        },
        this.options.resolve
      )
    );

    this.resolvers.context = ResolverFactory.createResolver(
      Object.assign(
        {
          fileSystem: this.inputFileSystem,
          resolveToContext: true
        },
        this.options.resolve
      )
    );

    this.resolvers.normal.resolveSync = node.create.sync(
      Object.assign(
        {
          fileSystem: this.inputFileSystem
        },
        this.options.resolve
      )
    );

    this.resolvers.context.resolveSync = node.create.sync(
      Object.assign(
        {
          fileSystem: this.inputFileSystem,
          resolveToContext: true
        },
        this.options.resolve
      )
    );

    let fnNormalBak = this.resolvers.normal.resolve;
    this.resolvers.normal.resolve = function(...args) {
      return new Promise((resolve, reject) => {
        args.push(function(err, filepath, meta) {
          if (err) {
            reject(err);
          } else {
            resolve({ path: filepath, meta: meta });
          }
        });
        fnNormalBak.apply(self.resolvers.normal, args);
      });
    };
    let fnContextBak = this.resolvers.context.resolve;
    this.resolvers.context.resolve = function(...args) {
      return new Promise((resolve, reject) => {
        args.push(function(err, filepath, meta) {
          if (err) {
            reject(err);
          } else {
            resolve({ path: filepath, meta: meta });
          }
        });
        fnContextBak.apply(self.resolvers.context, args);
      });
    };
  }

  clear(type) {
    this.hook('process-clear', type);
    return this;
  }

  run() {
    return this.init().then(() => this.start());
  }

  init() {
    this.register('process-clear', () => {
      this.beads = {};
      this.vendors = new moduleSet();
      this.assets = new moduleSet();
      this.fileDep = new fileDep();
    });

    initParser(this);
    initPlugin(this);

    this.hook('process-clear', 'init');

    return initCompiler(this, this.options.compilers);
  }

  createAppChain(file) {
    const pathObj = path.parse(file);
    const isWepy = pathObj.ext === this.options.wpyExt;
    let bead = this.producer.make(isWepy ? WepyBead : ScriptBead, file);
    const chain = new AppChain(bead);
    if (isWepy) {
      bead.type = 'app';
      chain.self('wepy');
    }
    return chain;
  }
  createPageChain(file) {
    const pathObj = path.parse(file);
    const isWepy = pathObj.ext === this.options.wpyExt;
    let bead = this.producer.make(isWepy ? WepyBead : ScriptBead, file);
    const chain = new PageChain(bead);
    if (isWepy) {
      bead.type = 'page';
      chain.self('wepy');
    }
    return chain;
  }

  createComponentChain(file) {
    const pathObj = path.parse(file);
    const isWepy = pathObj.ext === this.options.wpyExt;
    let bead = this.producer.make(isWepy ? WepyBead : ScriptBead, file);
    const chain = new ComponentChain(bead);
    if (isWepy) {
      bead.type = 'component';
      chain.self('wepy');
    }
    return chain;
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.logger.info('build app', 'start...');

    const chain = this.createAppChain(this.options.entry);

    //{ path: this.options.entry, type: 'app' })
    return this.hookUnique('make', chain)
      .then(chain => {
        const { bead, sfc } = chain;
        let config = sfc.config;

        let appConfig = config.bead.parsed.code.meta();
        if (!appConfig.pages || appConfig.pages.length === 0) {
          appConfig.pages = [];
          this.hookUnique('error-handler', {
            type: 'warn',
            bead,
            message: `Missing "pages" in App config`
          });
        }
        let pages = appConfig.pages.map(v => {
          return path.resolve(bead.path, '..', v);
        });

        if (appConfig.subPackages || appConfig.subpackages) {
          (appConfig.subpackages || appConfig.subPackages).forEach(sub => {
            sub.pages.forEach(v => {
              pages.push(path.resolve(bead.path, '../' + sub.root || '', v));
            });
          });
        }

        let tasks = pages.map(v => {
          let file;

          file = v + this.options.wpyExt;
          if (fs.existsSync(file)) {
            const pageChain = this.createPageChain(file);
            pageChain.root = chain;
            pageChain.setPrevious(chain);
            return this.hookUnique('make', pageChain);
          }
          file = v + '.js';
          if (fs.existsSync(file)) {
            const pageChain = this.createPageChain(file);
            pageChain.root = chain;
            pageChain.setPrevious(chain);
            return this.hookUnique('make', pageChain);
          }
          this.hookUnique('error-handler', {
            type: 'error',
            bead,
            message: `Can not resolve page: ${v}`
          });
        });

        if (appConfig.tabBar && appConfig.tabBar.custom) {
          let file = path.resolve(bead.path, '..', 'custom-tab-bar/index' + this.options.wpyExt);
          if (fs.existsSync(file)) {
            tasks.push(this.hookUnique('wepy-parser-wpy', { path: file, type: 'wepy' }));
          }
        }

        this.hookSeq('build-app', chain);
        this.hookUnique('output-app', chain);
        return Promise.all(tasks);
      })
      .then(this.buildComps.bind(this))
      .catch(this.handleBuildErr.bind(this));
  }

  buildComps(comps) {
    function buildComponents(comps) {
      if (!comps) {
        return Promise.resolve();
      }
      this.hookSeq('build-components', comps);
      this.hookUnique('output-components', comps);

      let tasks = [];

      comps.forEach(comp => {
        let config = comp.sfc.config || {};
        let parsed = config.bead.parsed || {};
        let parsedComponents = parsed.components || [];

        parsedComponents.forEach(com => {
          const chain = this.createComponentChain(com.path);
          tasks.push(this.hookUnique('make', chain));
          /*
          if (com.type === 'wepy' && !components.includes(com.path)) {
            // wepy 组件
            tasks.push(this.hookUnique('wepy-parser-wpy', com));
            components.push(com.path);
          } else if (com.type === 'weapp' && !originalComponents.includes(com.path)) {
            // 原生组件
            tasks.push(this.hookUnique('wepy-parser-component', com));
            originalComponents.push(com.path);
          }
          */
        });
      });

      if (tasks.length) {
        return Promise.all(tasks).then(buildComponents.bind(this));
      } else {
        return Promise.resolve();
      }
    }

    return buildComponents
      .bind(this)(comps)
      .then(() => {
        let vendorData = this.hookSeq('build-vendor', {});
        this.hookUnique('output-vendor', vendorData);
      })
      .then(() => {
        let assetsData = this.hookSeq('build-assets');
        this.hookUnique('output-assets', assetsData);
      })
      .then(() => {
        return this.hookUnique('output-static');
      })
      .then(() => {
        this.hookSeq('process-done');
        this.running = false;
        this.logger.info('build', 'finished');
        if (this.options.watch) {
          this.logger.info('watching...');
          this.watch();
        }
      });
  }

  weappBuild(buildTask) {
    if (this.running) {
      return;
    }
    this.running = true;
    this.logger.info('build weapp files', 'start...');

    const tasks = buildTask.files.map(file => {
      const comp = this.compiled[file];

      return this.hookUnique('wepy-parser-component', comp);
    });

    Promise.all(tasks)
      .then(this.buildComps.bind(this))
      .catch(this.handleBuildErr.bind(this));
  }

  partialBuild(buildTask) {
    if (this.running) {
      return;
    }
    this.running = true;
    this.logger.info('build wpy files', 'start...');

    // just compile these files of wpyExt
    const tasks = buildTask.files.map(file => {
      if (fs.existsSync(file)) {
        let type = 'page';
        if (this.compiled[file]) {
          type = this.compiled[file].type;
        }
        return this.hookUnique('wepy-parser-wpy', { path: file, type });
      }
      this.hookUnique('error-handler', {
        type: 'error',
        ctx: {},
        message: `Can not resolve page: ${file}`
      });
    });

    Promise.all(tasks)
      .then(this.buildComps.bind(this))
      .catch(this.handleBuildErr.bind(this));
  }

  assetsBuild(buildTask) {
    if (this.running) {
      return;
    }
    this.running = true;
    this.logger.info('build ' + buildTask.assetExt + ' files', 'start...');

    const tasks = buildTask.files.map(file => {
      const ctx = this.compiled[file];
      return this.hookUnique('wepy-parser-file', {}, ctx);
    });

    // just compile, build and out assets
    Promise.all(tasks)
      .then(() => {
        return this.buildComps(undefined);
      })
      .catch(this.handleBuildErr.bind(this));
  }

  handleBuildErr(err) {
    this.running = false;
    if (err.message !== 'EXIT') {
      this.logger.error(err);
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
  }

  watch() {
    if (this.watchInitialized) {
      return;
    }
    this.watchInitialized = true;
    let watchOption = Object.assign({ ignoreInitial: true, depth: 99 }, this.options.watchOption || {});
    // let target = path.resolve(this.context, this.options.target);

    if (watchOption.ignore) {
      let type = Object.prototype.toString.call(watchOption.ignore);
      if (type === '[object String]' || type === '[object RegExp]') {
        watchOption.ignored = [watchOption.ignored];
        watchOption.ignored.push(this.options.target);
      } else if (type === '[object Array]') {
        watchOption.ignored.push(this.options.target);
      }
    } else {
      watchOption.ignored = [this.options.target];
    }

    const pendingFiles = [];

    // debounce for watch files
    const onFileChanged = debounce(300, () => {
      const changedFiles = pendingFiles.splice(0, pendingFiles.length);
      if (changedFiles.length > 1) {
        // if more then one files changed, build the whole app.
        this.start();
      } else {
        let buildTask = {
          changed: changedFiles[0],
          partial: true,
          files: [],
          outputAssets: false
        };
        this.hookAsyncSeq('before-wepy-watch-file-changed', buildTask).then(task => {
          if (task.weapp && task.files.length > 0) {
            this.weappBuild(buildTask);
          } else if (task.outputAssets && task.files.length > 0) {
            this.assetsBuild(buildTask);
          } else if (task.partial && task.files.length > 0) {
            this.partialBuild(buildTask);
          } else {
            this.start();
          }
        });
      }
    });

    chokidar.watch([this.options.src], watchOption).on('all', (evt, filepath) => {
      if (evt === 'change') {
        const file = path.resolve(filepath);
        if (!pendingFiles.includes(file)) {
          pendingFiles.push(file);
        }
        onFileChanged();
      }
    });
  }

  getLang(type, ext) {
    const rule = this.options.weappRule[type];
    let lang = null;
    for (let i = 0; i < rule.length; i++) {
      if (rule[i].ext === ext) {
        lang = rule[i].lang;
        break;
      }
    }
    if (!lang) {
      lang = rule[0].lang;
    }

    return lang;
  }

  getLoader(type, ext) {
    const loaderName = this.getLang(type, ext);

    return function(bead) {
      const key = 'wepy-loader-' + loaderName;
      if (!this.hasHook(key)) {
        return Promise.resolve(bead);
      }
      return this.hookUnique(key, bead);
    }.bind(this);
  }

  compileAndParse(type, newChain) {
    const bead = newChain.bead;
    const lang = this.getLang(type, bead.ext);
    // Compile chain
    const key = 'wepy-compiler-' + lang;
    if (!this.hasHook(key)) {
      throw new Error(`Compiler "${key}" is not find.`);
    }
    return this.hookAsyncSeq('before-' + key, newChain.previous)
      .then(() => {
        return this.hookUnique(key, newChain);
      })
      .then(chain => {
        // Parse chain
        const key = 'wepy-parser-' + type;
        if (!this.hasHook(key)) {
          throw new Error(`Parser "${key}" is not find.`);
        }
        return this.hookAsyncSeq('before-' + key, chain).then(chain => {
          return this.hookUnique(key, chain);
        });
      });
  }

  applyCompiler(node, ctx) {
    ctx.id = this.assets.add(ctx.file);

    if (node.lang) {
      let hookKey = 'wepy-compiler-' + node.lang;

      if (!this.hasHook(hookKey)) {
        throw `Missing plugins ${hookKey}`;
      }

      let task;

      // If file is not changed, and compiled cache exsit.
      // Style may have dependences, maybe the dependences file changed. so ignore the cache for the style who have deps.
      if (ctx.useCache && node.compiled && (node.compiled.dep || []).length === 0) {
        task = Promise.resolve(node);
      } else {
        task = this.hookUnique(hookKey, node, ctx);
      }
      return task
        .then(node => {
          return this.hookAsyncSeq('before-wepy-parser-' + node.type, { node, ctx });
        })
        .then(({ node, ctx }) => {
          return this.hookUnique('wepy-parser-' + node.type, node, ctx);
        });
    }
  }

  getTarget(file, targetDir) {
    let relative = path.relative(path.join(this.context, this.options.src), file);
    let targetFile = path.join(this.context, targetDir || this.options.target, relative);
    return targetFile;
  }

  getModuleTarget(file, targetDir) {
    let relative = path.relative(this.context, file);
    let dirs = relative.split(path.sep);
    dirs.shift(); // shift node_modules
    relative = dirs.join(path.sep);
    let targetFile = path.join(this.context, targetDir || this.options.target, VENDOR_DIR, relative);
    return targetFile;
  }
}

exports = module.exports = program => {
  const opt = parseOptions.parse(program);

  opt.weappRule = extTransform(opt.weappRule);

  const compilation = new Compile(opt);

  return compilation;
};
