const linked = {
  "react": require.resolve("react"),
  "react-dom": require.resolve("react-dom"),
  "@expressive/mvc": require.resolve("@expressive/mvc"),
  "@expressive/css": require.resolve("@expressive/css"),
}

const babelrc = {
  presets: [
    "@babel/preset-typescript",
    "@expressive/babel-preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
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
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    historyApiFallback: true,
    hot: true
  },
  stats: {
    modules: false,
    assets: false,
    chunks: false
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
      }
    ]
  }
};