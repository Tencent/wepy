// copy https://github.com/vuejs/vue-loader/blob/master/lib/style-compiler/plugins/scope-id.js and fix by wepy

import postcss from 'postcss';

let plugin = postcss.plugin('rpx-convert', function () {
  return function (root) {
    root.walkDecls(function(decl, i) {
      if (decl.value.indexOf('px') === -1) {
        return;
      }
      let value = decl.value.replace(/"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)rpx/ig, (m, $1) => {
        if (!$1) {
            return m;
        }
        let pixels = parseFloat($1);
        let fixedVal = pixels / 2;
        return (fixedVal === 0) ? '0' : fixedVal + 'px';
      });
      decl.value = value;
    });
  };
});


export default function rpxConvert (content, cb) {
  return postcss(plugin()).process(content).css;
}