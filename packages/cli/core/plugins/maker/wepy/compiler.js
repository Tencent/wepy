const path = require('path');
const AppChain = require('../../../compile/chain').AppChain;
const { ConfigBead, ScriptBead, WxsBead, StyleBead, TemplateBead } = require('../../../compile/bead');
const sfcCompiler = require('vue-template-compiler');
const loaderUtils = require('loader-utils');
const DEFAULT_WEAPP_RULES = require('./../../../util/const').DEFAULT_WEAPP_RULES;

const trailingSlash = /[/\\]$/;

const beadsMap = {
  config: ConfigBead,
  script: ScriptBead,
  wxs: WxsBead,
  template: TemplateBead,
  styles: StyleBead
};

const sfcWeappMap = {
  config: 'config',
  script: 'script',
  template: 'template',
  styles: 'style',
  wxs: 'wxs'
};

exports = module.exports = function() {
  this.register('compile-wepy', function(chain) {
    const bead = chain.bead;
    bead.parser('weapp');
    chain.self('wepy');

    let sfcObj = sfcCompiler.parseComponent(bead.content, { pad: 'space' });
    sfcObj = this.hookSeq('sfc-custom-block', sfcObj);
    if (!chain.sfc) {
      chain.sfc = {};
    }

    // Set default content
    for (const key in DEFAULT_WEAPP_RULES) {
      if (key === 'style') {
        if (!sfcObj.styles || sfcObj.styles.length === 0) {
          sfcObj.styles = [{ content: DEFAULT_WEAPP_RULES.style.content, lang: DEFAULT_WEAPP_RULES[key].lang }];
        }
      } else {
        if (!sfcObj[key]) {
          sfcObj[key] = { content: DEFAULT_WEAPP_RULES[key].content, lang: DEFAULT_WEAPP_RULES[key].lang };
        }
      }
    }
    const sfcType = ['config', 'script', 'template', 'styles'];

    if (sfcObj.hasOwnProperty('wxs')) sfcType.push('wxs');

    sfcType.forEach(item => {
      if (Array.isArray(sfcObj[item])) {
        chain.sfc[item] = sfcObj[item].map((obj, i) => {
          const newBead = this.producer.make(beadsMap[item], bead.path, `${bead.id}$${item}$${i}`, obj.content);
          newBead.data = obj;
          newBead.lang = obj.lang || bead.lang || DEFAULT_WEAPP_RULES[sfcWeappMap[item]].lang;
          if (obj.module) newBead.setModule(obj.module);
          return chain.createChain(newBead);
        });
      } else {
        if (item === 'template' && chain instanceof AppChain) {
          // ignore template for app chain
        } else {
          const newBead = this.producer.make(beadsMap[item], bead.path, bead.id + '$' + item, sfcObj[item].content);
          newBead.data = sfcObj[item];
          newBead.lang = sfcObj[item].lang || newBead.lang || DEFAULT_WEAPP_RULES[sfcWeappMap[item]].lang;
          chain.sfc[item] = chain.createChain(newBead);
        }
      }
    });
    return this.hookAsyncSeq('parse-sfc-src', chain, sfcObj).then(() => chain);
  });

  this.register('parse-sfc-src', function(sfcChain, sfcObj) {
    let tasks = [];
    let bead = sfcChain.bead;
    let dir = path.parse(bead.path).dir;
    dir = dir.replace(trailingSlash, '');

    for (let type in sfcObj) {
      // wxs is an array.
      let nodes = [].concat(sfcObj[type]);
      let chains = [].concat(sfcChain.sfc[type]);
      nodes.forEach((node, i) => {
        const src = node ? node.src : '';
        if (src) {
          const request = loaderUtils.urlToRequest(src, src.charAt(0) === '/' ? '' : null);
          tasks.push(
            this.resolvers.normal.resolve({}, dir, request, {}).then(rst => {
              const chain = chains[i];
              const bead = chain.bead;
              // Update reference path. error handler will show the reference path
              // e.g. a.wpy <script src=b.js />, error handler shows b.js
              bead.refPath = rst.path;
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
      sfc.config.lang = sfc.config.attrs.lang || 'json';
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
    block.module = block.attrs.module || 'wxsModule';
    sfc.wxs.push(block);
    return { sfc, block };
  });
};
