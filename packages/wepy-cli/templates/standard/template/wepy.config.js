var prod = process.env.NODE_ENV === 'production'

module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  compilers: {
    less: {
      compress: true
    },
    /*sass: {
      outputStyle: 'compressed'
    },*/
    babel: {
      presets: [
        'es2015',
        'stage-1'
      ],
      plugins: [
        'transform-export-extensions',
        'syntax-export-extensions'
      ]
    }
  },
  plugins: {
  }
}

if (prod) {
  // 压缩sass
  // module.exports.compilers['sass'] = {outputStyle: 'compressed'}

  // 压缩less
  module.exports.compilers['less'] = {compress: true}

  // 压缩js
  module.exports.plugins = {
    uglifyjs: {
      filter: /\.js$/,
      config: {
      }
    },
    imagemin: {
      filter: /\.(jpg|png|jpge)$/,
      config: {
        jpg: {
          quality: 80
        },
        png: {
          quality: 80
        }
      }
    }
  }
}
