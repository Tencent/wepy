const fs = require('fs');
const path = require('path');
const ConfigBead = require('../ConfigBead');
const ScriptBead = require('../ScriptBead');
const StyleBead = require('../StyleBead');
const TemplateBead = require('../TemplateBead');
const sfcCompiler = require('vue-template-compiler');
const loaderUtils = require('loader-utils');
const DEFAULT_WEAPP_RULES = require('./../../util/const').DEFAULT_WEAPP_RULES;

const trailingSlash = /[/\\]$/;

exports = module.exports = function() {
  this.register('wepy-loader-wpy', function(bead) {
    let sfcObj = sfcCompiler.parseComponent(bead.content, { pad: 'sapce' });
    sfcObj = this.hookSeq('sfc-custom-block', sfcObj);

    // Set default content
    for (const key in DEFAULT_WEAPP_RULES) {
      if (key === 'style') {
        if (!sfcObj.styles || sfcObj.styles.length === 0) {
          sfcObj.styles = [{ content: DEFAULT_WEAPP_RULES.style.content }];
        }
      } else {
        if (!sfcObj[key]) {
          sfcObj[key] = { content: DEFAULT_WEAPP_RULES.script.content };
        }
      }
    }

    // Create sfc bead
    bead.sfc.config = this.createBead(bead.id + '$config', bead.path, sfcObj.config.content, ConfigBead);
    bead.sfc.script = this.createBead(bead.id + '$script', bead.path, sfcObj.script.content, ScriptBead);
    // App do not need template
    if (!bead.isApp()) {
      bead.sfc.template = this.createBead(bead.id + '$template', bead.path, sfcObj.template.content, TemplateBead);
    }
    bead.sfc.styles = sfcObj.styles.map((obj, i) => {
      return this.createBead(bead.id + '$style$' + i, bead.path, obj.content, StyleBead);
    });

    return this.hookAsyncSeq('parse-sfc-sfc', bead, sfcObj).then(() => bead);
  });

  this.register('parse-sfc-src', function(sfcBead, sfcObj) {
    let tasks = [];
    let dir = path.parse(sfcBead.path).dir;
    dir = dir.replace(trailingSlash, '');

    for (let type in sfcObj) {
      // wxs is an array.
      let nodes = [].concat(sfcObj[type]);
      nodes.forEach(node => {
        const src = node ? node.src : '';
        if (src) {
          const request = loaderUtils.urlToRequest(src, src.charAt(0) === '/' ? '' : null);
          tasks.push(
            this.resolvers.normal.resolve({}, dir, request, {}).then(rst => {
              const bead = sfcBead.sfc[type];
              bead.reload(fs.readFileSync(rst.path, 'utf-8'));
              // Update reference path. error handler will show the reference path
              // e.g. a.wpy <script src=b.js />, error handler shows b.js
              bead.refPath = rst.path;
              this.fileDep.addDeps(bead.path, [bead.refPath]);
            })
          );
        }
      });
    }
    return Promise.all(tasks);
  });

  this.register('sfc-custom-block', function(sfc) {
    if (!sfc.customBlocks || sfc.customBlocks.length === 0) return sfc;

    sfc.customBlocks = sfc.customBlocks.filter(block => {
      if (block.attrs && block.attrs.src) {
        block.src = block.attrs.src;
      }
      let hookKey = 'sfc-custom-block-' + block.type;
      let has = this.hasHook(hookKey);
      if (has) {
        ({ sfc, block } = this.hookSeq(hookKey, { sfc, block }));
      }
      return !has;
    });

    return sfc;
  });

  this.register('sfc-custom-block-config', function({ sfc, block }) {
    if (!sfc.config) {
      sfc.config = block;
      sfc.config.lang = sfc.config.lang || 'json';
      sfc.config.type = 'config';
    } else {
      this.logger.warn('config', 'mutiple config is defined');
    }
    return { sfc, block };
  });

  this.register('sfc-custom-block-wxs', function({ sfc, block }) {
    if (!sfc.wxs) sfc.wxs = [];
    block.lang = block.attrs.lang || 'js';
    block.type = 'wxs';
    sfc.wxs.push(block);
    return { sfc, block };
  });
};
