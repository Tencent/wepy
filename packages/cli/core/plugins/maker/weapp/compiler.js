const path = require('path');
const { ConfigBead, ScriptBead, StyleBead, TemplateBead } = require('../../../compile/bead');

const beadsMap = {
  config: ConfigBead,
  script: ScriptBead,
  template: TemplateBead,
  styles: StyleBead
};

const weappResolverMap = {
  styles: compilation => compilation.resolvers.weapp.style,
  config: compilation => compilation.resolvers.weapp.config,
  script: compilation => compilation.resolvers.weapp.script,
  template: compilation => compilation.resolvers.weapp.template
};

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

    return Object.keys(sfcObj).map(item => {
      const weappResolver = weappResolverMap[item](this);
      const request = './' + parsedPath.name;

      return weappResolver.resolve({}, parsedPath.dir, request, {}).then(rst => {
        const newBead = this.producer.make(beadsMap[item], rst.path);
        const newChain = chain.createChain(newBead);

        return this.hookUnique('make', newChain).then(c => {
          const rstChain = c.sfc ? c.sfc[item] : c;
          if (Array.isArray(sfcObj[item])) {
            chain.sfc[item] = [].concat(rstChain);
          } else {
            chain.sfc[item] = rstChain;
          }
        });
      });
    });
  });

  this.register('compile-weapp', function(chain) {
    const bead = chain.bead;
    bead.parser('weapp');

    const tasks = this.hookUnique('compile-weapp-dispatch', chain);

    return Promise.all(tasks).then(() => chain);
  });
};
