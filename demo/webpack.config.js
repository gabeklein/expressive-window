const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const linked = {
  "react": require.resolve("react"),
  "react-dom": require.resolve("react-dom"),
  "@expressive/mvc": require.resolve("@expressive/mvc"),
  "@expressive/css": require.resolve("@expressive/css"),
}

const babelrc = {
  presets: [
    require("@babel/preset-typescript"),
    require("@expressive/babel-preset-react")
  ],
  plugins: [
    require("@babel/plugin-proposal-class-properties"),
    require("react-refresh/babel")
  ]
}

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js"
  },
  output: {
    path: __dirname + "/public",
    publicPath: "/",
    devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
  },
  devtool: "source-map",
  stats: {
    modules: false,
    assets: false,
    chunks: false
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    historyApiFallback: true,
    hot: true
  },
  resolve: {
    alias: linked,
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelrc
        }
      },
      {
        test: /\.(svg|png|jpg|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: "./src/index.html"
    })
  ]
};