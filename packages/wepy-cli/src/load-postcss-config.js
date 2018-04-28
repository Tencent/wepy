import postcssrc from 'postcss-load-config'

export default function loadPostcssConfig () {
  return postcssrc().then(config => {
    return config;
  })
}
