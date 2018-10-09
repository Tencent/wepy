exports = module.exports = function () {
  this.register('sfc-custom-block', function (sfc) {

    if (!sfc.customBlocks || sfc.customBlocks.length === 0)
      return sfc;

    sfc.customBlocks.forEach(block => {
      ({sfc, block} = this.hookSeq('sfc-custom-block-' + block.type, {sfc, block}));
    });

    return sfc;
  });

  this.register('sfc-custom-block-config', function ({sfc, block}) {
    if (!sfc.config) {
      sfc.config = block;
      sfc.config.lang = sfc.config.lang || 'json';
    } else {
      this.logger.warn('config', 'mutiple config is defined');
    }
    return {sfc, block};
  });

  this.register('sfc-custom-block-wxs', function ({sfc, block}) {
    if (!sfc.wxs)
      sfc.wxs = [];
    block.lang = block.attrs.lang || 'js';
    sfc.wxs.push(block);
    return {sfc, block};
  });
}
