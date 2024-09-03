/* eslint-disable @typescript-eslint/no-require-imports */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('node:path');
const { DefinePlugin, BannerPlugin, HotModuleReplacementPlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals')

const isDev = process.env.MODE === 'development'

module.exports = {
  mode: process.env.MODE,
  target: 'node',
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: { main: './src/server.ts' },
  output: {
    path: isDev ? path.resolve(__dirname, 'dist/debug/server')
      : path.resolve(__dirname, 'dist/release/server'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  devtool: isDev ? 'inline-source-map' : 'source-map',
  plugins: [
    new DefinePlugin({
      'process.env.MODE': JSON.stringify(process.env.MODE),
      'process.env.PORT': JSON.stringify(process.env.PORT),
      'process.env.PROJECT_DIR': JSON.stringify(path.resolve(__dirname)),
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: isDev ? {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        } : 'ts-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'default' }],
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: isDev
              }]
            ]
          }
        }
      }
    ]
  }
}