/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const common = require('../../webpack.config')

module.exports = function (env, args) {
  env = Object.assign(
    {
      name: 'fate-ui-component',
      server: false,
      library: true,
      root: __dirname,
      html: '',
      level: 'lib',
      icon: '',
    },
    env
  );

  const options = {
    entry: env.server ? './html/main.ts' : './lib/main.ts',
  }

  if (args.mode === 'development') {
    options.devServer = {
      static: './html/dist',
      port: 10002
    };
  } else if (args.mode === 'production') {
    options.externals = ['lodash', 'vue', 'element-plus', '@element-plus/icons-vue', 'fate-tools']
    options.output = {
      library: {
        type: 'commonjs',
      },
    }
  }

  return merge(common(env, args), options)
}
