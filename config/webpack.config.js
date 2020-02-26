'use strict';

const path = require('path');
const webpack = require('webpack');

const config = {
  mode: 'production',
  target: 'electron-main',
  context: path.resolve(__dirname, '..'),
  externals: {
    atom: 'atom',
  },
  entry: './lib/kite.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'dist'),
    libraryTarget: 'commonjs2',
    library: '',
  },
  resolve: {
    modules: ['../node_modules']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          { loader: 'babel-loader' },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'dependency-assets',
        },
      }
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      PRODUCTION: JSON.stringify(true),
    }),
  ],
  node: {
    __dirname: false,
  },
};

module.exports = config;