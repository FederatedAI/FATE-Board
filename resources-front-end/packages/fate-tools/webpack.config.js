/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const common = require('../../webpack.config')

module.exports = function (env, args) {
  env = Object.assign(
    {
      name: 'fate-tools',
      library: true,
      server: false,
      root: __dirname,
      html: '',
      level: 'lib',
      icon: ''
    },
    env
  );

  const options = {
    entry: env.server ? './html/main.ts' : './lib/main.ts'
  }

  if (args.mode === 'development') {
    options.devServer = {
      static: './html/dist',
      port: 10003
    };
  } else if (args.mode === 'production') {
    options.externals = ['lodash']
    options.output = {
      library: {
        type: 'commonjs',
      },
    }
  }

  return merge(common(env, args), options)
}
