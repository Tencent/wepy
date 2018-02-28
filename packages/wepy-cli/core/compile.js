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
const logger = require('./logger');

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
    ['wpy', 'script', 'style', 'template'].forEach(k => {
      let parser = k[0].toUpperCase() + k.slice(1);
      this.parsers[k] = require('./parse' + parser);
      this.parsers[k].compilation = this;
    });

  }

  start () {

    this.parsers.wpy.parse(this.options.entry).then(app => {
      let script = app.data[0];
      let styles = app.data[1];

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
      this.buildApp(app);
      return Promise.all(tasks);
    }).then(pages => {
      this.buildPage(pages);
      this.buildNPM();
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

  getTarget (file) {
    let relative = path.relative(path.join(this.context, this.options.src), file);
    let target = path.join(this.context, this.options.target, relative);
    return target;
  }

  buildApp (app) {
    logger.info('app', 'building App');

    let script = app.data[0];
    let style = app.data[1];

    let targetFile = path.join(this.context, this.options.target, 'app');

    let scriptCode = this.fixDep(script);
    let styleCode = '';

    style.forEach(v => {
      styleCode += v.code + '\n';
    });

    fs.writeFile(targetFile + '.js', scriptCode, function () {});
    fs.writeFile(targetFile + '.wxss', styleCode, function () {});
  }

  buildPage (pages) {
    logger.info('page', 'building pages');

    pages.forEach(page => {
      let script = page.data[0];
      let style = page.data[1];
      let template = page.data[2];

      let targetFile = this.getTarget(script.file);
      debugger;
      let scriptCode = this.fixDep(script);
      let templateCode = template.code;
      let styleCode = '';

      style.forEach(v => {
        styleCode += v.code + '\n';
      });

      let target = path.parse(targetFile);

      fs.writeFile(path.join(target.dir, target.name + '.js'), scriptCode, function () {});
      fs.writeFile(path.join(target.dir, target.name + '.wxml'), templateCode, function () {});
      fs.writeFile(path.join(target.dir, target.name + '.wxss'), styleCode, function () {});
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
   return __wepy_require;
})([
${npmCode}
]);
`
    let targetFile = path.join(this.context, this.options.target, 'npm.js');
    fs.writeFile(targetFile, npmCode, function () {});
  }


  fixDep (data, inNPM) {
    let code = data.code;
    let fixPos = 0;
    data.parser.deps.forEach((dep, i) => {
      let depMod = data.depModules[i];
      let moduleId = (typeof depMod === 'object') ? depMod.id : depMod;
      let repleaceMent = '';
      if (inNPM) {
        repleaceMent = `__wepy_require(${moduleId})`;
      } else {
        if (typeof moduleId === 'number') {
          let npmfile = path.join(this.context, this.options.src, 'npm.js');
          let relativePath = path.relative(path.dirname(data.file), npmfile);
          repleaceMent = `require('${relativePath}')(${moduleId})`;
        } else if (depMod && depMod.sfc) {
          let relativePath = path.relative(path.dirname(data.file), depMod.file);
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
