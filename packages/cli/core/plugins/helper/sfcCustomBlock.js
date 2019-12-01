exports = module.exports = function() {
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
      sfc.config.lang = block.attrs.lang || 'json';
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
