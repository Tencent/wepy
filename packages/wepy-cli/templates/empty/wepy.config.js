const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  cliLogs: !isProd,
  compilers: {
    less: {
      'compress': isProd
    },
    // sass: {
    //   outputStyle: 'compressed'
    // },
    babel: {
      'sourceMap': !isProd,
      'presets': [
        'env'
      ],
      'plugins': [
        'babel-plugin-transform-class-properties',
        'transform-export-extensions',
        'syntax-export-extensions'
      ]
    }
  },
  plugins: !isProd ? {} : {
    uglifyjs: {
      filter: /\.js$/,
      config: {}
    },
    imagemin: {
      filter: /\.(jpg|png|jpeg)$/,
      config: {
        'jpg': {
          quality: 80
        },
        'png': {
          quality: 80
        }
      }
    }
  },
  appConfig: {
    noPromiseAPI: ['createSelectorQuery']
  }
}
