const path = require('node:path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/bootstrap.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist/release/browser'), // Output path for production build
    filename: '[name].[contenthash].bundle.js', // Cache-busting with content hash
    publicPath: '/', // Ensure correct paths for assets
    clean: true, // Clean the output directory before building
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  devtool: 'source-map', // Generate source maps for production (can be omitted if not needed)
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Extract CSS into separate files with content hash
    }),
    new HtmlWebpackPlugin({
      template: './index.html', // Use a template HTML file
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader', // Use ts-loader for TypeScript
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }], // Transpile for a wide range of browsers
              ['@babel/preset-react', { runtime: 'automatic' }], // Enable the new JSX transform
            ],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'], // Extract CSS files for production
      },
    ],
  },
  optimization: {
    minimize: true, // Enable minimization
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console logs for production
          },
        },
      }),
      new CssMinimizerPlugin(), // Minimize CSS
    ],
    splitChunks: {
      chunks: 'all', // Split vendor and application code
      maxInitialRequests: 30,
      maxAsyncRequests: 30,
      minSize: 20000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime', // Create a runtime chunk to manage caching
    },
  },
};

