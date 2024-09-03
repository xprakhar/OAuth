import { HotModuleReplacementPlugin } from 'webpack';
import { Configuration } from 'webpack-dev-middleware';

// const port = parseInt(process.env.PORT || '8080');
const config: Configuration = {
  mode: 'development',
  entry: {
    main: [
      // Dev server client for web socket transport, hot and live reload logic
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
      // My entry
      './src/bootstrap.tsx',
    ],
  },
  output: {
    path: '/',
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [new HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'default' }],
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic',
                  throwIfNamespace: true,
                  development: false,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
};

export { config };
