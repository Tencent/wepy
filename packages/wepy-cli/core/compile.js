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
const logger = require('./logger');
const Hook = require('./hook');

const ENTRY_FILE = 'app.wpy';

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

  }

  start () {

    this.parsers.wpy.parse(this.options.entry, 'app').then(app => {
debugger;
      let sfc = app.sfc;
      let script = sfc.script;
      let styles = sfc.styles;
      let config = sfc.config;

      let appConfig = config.parsed;
      debugger;
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
      this.buildApp(app);
      return Promise.all(tasks);
    }).then(pages => {
      this.buildPage(pages);

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


      this.buildNPM();

      return Promise.all(tasks);
    }).then(comps => {
      debugger;
      this.buildComponent(comps);
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

  buildApp (app) {
    logger.info('app', 'building App');

    let sfc = app.sfc;
    let script = sfc.script;
    let styles = sfc.styles;
    let config = sfc.config;

    let targetFile = path.join(this.context, this.options.target, 'app');


    config.outputCode = JSON.stringify(config.parsed, null, 4);
    script.outputCode = this.fixDep(script.parsed);

    let styleCode = '';

    styles.forEach(v => {
      styleCode += v.parsed.css + '\n';
    });

    styles.outputCode = styleCode;

    app.outputFile = targetFile;

    this.output(app);
  }

  buildPage (pages) {
    logger.info('page', 'building pages');

    pages.forEach(page => {
      let sfc = page.sfc;
      let { script, styles, config, template } = sfc;

      let styleCode = '';
      styles.forEach(v => {
        styleCode += v.parsed.css + '\n';
      });

      config.outputCode = JSON.stringify(config.parsed, null, 4);
      script.outputCode = this.fixDep(script.parsed);
      styles.outputCode = styleCode;
      template.outputCode = template.parsed.code;

      let targetFile = this.getTarget(page.file);
      let target = path.parse(targetFile);
      page.outputFile = path.join(target.dir, target.name);

      this.output(page);
    });
  }

  buildComponent (comps) {
    logger.info('component', 'building components');

    comps.forEach(comp => {
      let sfc = comp.sfc;
      let { script, styles, config, template } = sfc;

      let styleCode = '';
      styles.forEach(v => {
        styleCode += v.parsed.css + '\n';
      });

      config.parsed.component = true;
      config.outputCode = JSON.stringify(config.parsed, null, 4);
      script.outputCode = this.fixDep(script.parsed);
      styles.outputCode = styleCode;
      template.outputCode = template.parsed.code;



      let targetFile = this.getTarget(comp.file);
      let target = path.parse(targetFile);
      comp.outputFile = path.join(target.dir, target.name);

      this.output(comp);
    });
  }

  buildNPM () {
    logger.info('npm', 'building npm');

    let npmList = this.npm.array();
    let npmCode = '';

    npmList.forEach((npm, i) => {
      let data = this.npm.data(npm);
      npmCode += '/***** module ' + i + ' start *****/\n';
      npmCode += '/***** ' + data.file + ' *****/\n';
      npmCode += 'function(module, exports, __wepy_require) {';
      npmCode += this.fixDep(data, true) + '\n';
      npmCode += '}';
      if (i !== npmList.length - 1) {
          npmCode += ',';
      }
      npmCode += '/***** module ' + i + ' end *****/\n\n\n';
    });

    npmCode = `
(function(modules) {
   // The module cache
   var installedModules = {};
   // The require function
   function __wepy_require(moduleId) {
       // Check if module is in cache
       if(installedModules[moduleId])
           return installedModules[moduleId].exports;
       // Create a new module (and put it into the cache)
       var module = installedModules[moduleId] = {
           exports: {},
           id: moduleId,
           loaded: false
       };
       // Execute the module function
       modules[moduleId].call(module.exports, module, module.exports, __wepy_require);
       // Flag the module as loaded
       module.loaded = true;
       // Return the exports of the module
       return module.exports;
   }
   // expose the modules object (__webpack_modules__)
   __wepy_require.m = modules;
   // expose the module cache
   __wepy_require.c = installedModules;
   // __webpack_public_path__
   __wepy_require.p = "/";
   // Load entry module and return exports
   module.exports = __wepy_require;
   return __wepy_require;
})([
${npmCode}
]);
`
    let targetFile = path.join(this.context, this.options.target, 'npm.js');
    fs.outputFile(targetFile, npmCode, function () {});
  }


  fixDep (parsed, inNPM) {
    let code = parsed.code;
    let fixPos = 0;
    parsed.parser.deps.forEach((dep, i) => {
      let depMod = parsed.depModules[i];
      let moduleId = (typeof depMod === 'object') ? depMod.id : depMod;
      let repleaceMent = '';
      if (inNPM) {
        repleaceMent = `__wepy_require(${moduleId})`;
      } else {
        if (typeof moduleId === 'number') {
          let npmfile = path.join(this.context, this.options.src, 'npm.js');
          let relativePath = path.relative(path.dirname(parsed.file), npmfile);
          repleaceMent = `require('${relativePath}')(${moduleId})`;
        } else if (depMod && depMod.sfc) {
          let relativePath = path.relative(path.dirname(parsed.file), depMod.file);
          let reg = new RegExp('\\' + this.options.wpyExt + '$', 'i');
          relativePath = relativePath.replace(reg, '.js');
          repleaceMent = `require('${relativePath}')`;
        } else if (depMod === false) {
          repleaceMent = '{}';
        } else {
          repleaceMent = `require('${dep.module}')`;
        }
      }
      code = code.substring(0, dep.expr.start + fixPos) + repleaceMent + code.substr(dep.expr.end + fixPos);
      fixPos += repleaceMent.length - dep.expr.end + dep.expr.start;
    });
    return code;
  }

}


exports = module.exports = (program) => {
  let opt = parseOptions.convert(program);

  return new Compile(opt);
}
