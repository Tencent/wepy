const DefinePlugin = require('../../index');

module.exports = {
  plugins: [
    DefinePlugin({
      BASE_URL: JSON.stringify('http://www.bar.com')
    }),
    DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'typeof window': JSON.stringify('undefined'),
    })
  ],
}
