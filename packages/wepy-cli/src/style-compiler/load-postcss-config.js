const postcssrc = require('postcss-load-config');

function loadPostcssConfig () {
  return new Promise((reslove, reject) => {
    postcssrc().then(config => {
      reslove(config);
    }).catch(e => {
      reject(e);
    });
  });
}

export default loadPostcssConfig
