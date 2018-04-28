import loadPostcssConfig from './load-postcss-config';
import postcss from 'postcss';

export default function postcssHandler (content) {
  return loadPostcssConfig.then(config => {
    postcss(config)
    .process(content, {
      from: undefined
    })
    .then(result => {
      return result.css;
    }).catch(e => {
      return Promise.reject(e);
    })
  }).catch(e => {
    return Promise.reject(e);
  });
}
