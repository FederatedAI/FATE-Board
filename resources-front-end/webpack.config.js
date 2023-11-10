/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = function (env, args) {
  env = Object.assign(
    {
      name: '',
      library: false,
      server: false,

      html: './html/index.html',
      root: __dirname,
      level: 'lib',
    },
    env
  );

  const options = {
    mode: args.mode,

    output: {
      path: path.resolve(env.root, 'dist'),
      filename: `[name].${
        env.server || args.mode === 'development' ? 'dev.' : ''
      }js`
    },

    resolve: {
      extensions: ['.vue', '.ts', '.tsx', '.js', '.json'],
      alias: {
        '@': path.resolve(env.root, env.level),
      },
    },

    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },

        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },

        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },

        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000,
              },
            },
          ],
        },

        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'url-loader'
            },
          ],
        },

        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            reactivityTransform: true,
          },
        },

        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    },

    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          commons: {
            chunks: 'all',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            name: 'commons',
          },
        },
      },
    },

    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
    ],
  };

  if (args.mode === 'development') {
    options.devServer = {
      hot: false,
      open: true,
      port: 8028,
      client: {
        overlay: {
          runtimeErrors: false
        }
      }
    };
  }

  if (env.html) {
    options.plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(env.root, env.html),
      })
    );
  }

  return options;
};
