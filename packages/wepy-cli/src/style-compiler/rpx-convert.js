import postcss from 'postcss';

let rpxConvert = postcss.plugin('rpx-convert', function () {
  return function (root) {
    root.walkDecls(function(decl, i) {
      // replace page to body
      if (decl.parent.selector === 'page') {
        decl.parent.selector = 'body';
      }
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

export default function handler (content, cb) {
  return postcss(rpxConvert()).process(content).css;
}