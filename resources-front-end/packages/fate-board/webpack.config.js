/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const common = require('../../webpack.config')
const webpack = require('webpack')

module.exports = function (env, args) {
  env = Object.assign(
    {
      name: 'fate-board',
      level: 'src',
      server: false,
      root: __dirname
    },
    env
  );

  const options = {
    entry: './src/main.ts',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': require('./dev.env'),
        '__VUE_OPTIONS_API__': true,
        '__VUE_PROD_DEVTOOLS__': false
      }),
    ],
  }

  if (args.mode === 'development') {
    options.devServer = {
      static: './html/dist',
      proxy: {}
    };
  }

  const configuration = merge(common(env, args), options)
  delete configuration.output.library
  return configuration
}
