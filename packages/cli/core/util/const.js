exports = module.exports = {
  EVENT_PROXY: '_proxy',
  VENDOR_DIR: '$vendor',
  WEAPP_EXT: '.$weapp',
  DEFAULT_WEAPP_RULES: {
    script: { ext: '.js', lang: 'js', content: 'Component({})' },
    template: { ext: '.wxml', lang: 'wxml', content: '' },
    style: { ext: '.wxss', lang: 'wxss', content: '' },
    config: { ext: '.json', lang: 'json', content: '{}' }
  }
};
