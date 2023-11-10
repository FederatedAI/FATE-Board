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
      }),
    ],
  }

  if (args.mode === 'development') {
    options.devServer = {
      static: './html/dist',
      proxy: {
        '/log/new': {
          target: 'ws://127.0.0.1:8008',
          ws: true,
          secure: false
        },
        '/websocket/progress': {
          target: 'ws://127.0.0.1:8008',
          ws: true,
          secure: false
        },
        '*': 'http://127.0.0.1:8008'
      }
    };
  }

  const configuration = merge(common(env, args), options)
  delete configuration.output.library
  return configuration
}
