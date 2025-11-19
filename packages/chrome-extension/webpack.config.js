const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: 'cheap-module-source-map',

  entry: {
    background: './src/background/index.ts',
    'content-vinted': './src/content-scripts/content-vinted.ts',
    'content-leboncoin': './src/content-scripts/content-leboncoin.ts',
    'content-bridge': './src/content-scripts/content-bridge.ts',
    popup: './src/popup/index.tsx',
    options: './src/options/index.tsx',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@annoncify/shared': path.resolve(__dirname, '../shared/src'),
    },
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/index.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: './src/options/index.html',
      filename: 'options.html',
      chunks: ['options'],
    }),
  ],

  optimization: {
    splitChunks: false,
  },
}
