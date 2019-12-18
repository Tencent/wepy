const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');
const AppChain = require('../../../compile/chain').AppChain;
const { ConfigBead, ScriptBead, StyleBead, TemplateBead } = require('../../../compile/bead');
const DEFAULT_WEAPP_RULES = require('./../../../util/const').DEFAULT_WEAPP_RULES;

const readFile = (file, defaultValue = '') => {
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf-8');
  }
  return defaultValue;
};

const beadsMap = {
  config: ConfigBead,
  script: ScriptBead,
  template: TemplateBead,
  styles: StyleBead
};

const sfcTypeMap = {
  style: 'styles',
  config: 'config',
  script: 'script',
  template: 'template'
}

exports = module.exports = function() {
  this.register('compile-weapp-dispatch', function(chain) {
    const bead = chain.bead;
    const parsedPath = path.parse(bead.path);
    const chainType = bead.chainType();

    const sfcObj = {
      styles: [],
      script: {},
      config: {}
    };

    if (!chainType.app) sfcObj.template = {};

    Object.keys(sfcTypeMap).map(item => {
      const request = './' + parsedPath.name;
      this.resolvers.weapp[item].resolve({}, parsedPath.dir, request, {})
        .then(rst => {
            // if (sfcObj[type])
            // const newBead = this.producer.make(beadsMap[item], file + obj.ext, `${bead.id}$${item}$${i}`, obj.content);
            // newBead.data = obj;
            // newBead.lang = obj.lang;
            // chain.sfc[type] = chain.createChain(newBead);
        })
    });
  });

  this.register('compile-weapp', function(chain) {
    const bead = chain.bead;
    const parsedPath = path.parse(bead.path);
    const file = path.join(parsedPath.dir, parsedPath.name);
    
    const sfcObj = {
      styles: [],
      script: {},
      template: {},
      config: {}
    };

    bead.parser('weapp');

    this.hookUnique('compile-weapp-dispatch', chain);

    sfcObj.styles[0] = {
      content: readFile(file + '.wxss'),
      type: 'style',
      ext: '.wxss'
    };

    sfcObj.template = {
      content: readFile(file + '.wxml'),
      type: 'template',
      ext: '.wxml'
    };

    // JS file should be there.
    sfcObj.script = {
      content: readFile(file + '.js', 'Page({})'),
      type: 'script',
      ext: '.js'
    };

    sfcObj.config = {
      content: readFile(file + '.json', '{}'),
      type: 'config',
      ext: '.json'
    };

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
    ['config', 'script', 'template', 'styles'].forEach(item => {
      if (Array.isArray(sfcObj[item])) {
        chain.sfc[item] = sfcObj[item].map((obj, i) => {
          const newBead = this.producer.make(beadsMap[item], file + obj.ext, `${bead.id}$${item}$${i}`, obj.content);
          newBead.data = obj;
          newBead.lang = obj.lang;
          return chain.createChain(newBead);
        });
      } else {
        if (item === 'template' && chain instanceof AppChain) {
          // ignore template for app chain
        } else {
          const newBead = this.producer.make(
            beadsMap[item],
            file + sfcObj[item].ext,
            bead.id + '$' + item,
            sfcObj[item].content
          );
          newBead.data = sfcObj[item];
          newBead.lang = sfcObj[item].lang;
          chain.sfc[item] = chain.createChain(newBead);
        }
      }
    });
    return Promise.resolve(chain);
  });
};
