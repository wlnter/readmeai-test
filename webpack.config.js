// Generated using webpack-cli https://github.com/webpack/webpack-cli
const glob = require("glob");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

// const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';
const stylesHandler = "style-loader";

const config = {
  entry: glob.sync("./src/*.js").reduce((acc, path) => {
    const name = path
      .replace("./src/", "")
      .replace(".js", "")
      .replace(".json", "");
    acc[name] = path;
    return acc;
  }, {}),
  output: {
    filename: "script/[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".js", ".json"],
  },
  devServer: {
    open: true,
    host: "localhost",
    proxy: {
      "/cart": "http://127.0.0.1:3000",
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/config"),
          to: path.resolve(__dirname, "dist/config"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "checkout.html"),
      filename: "checkout.html",
      chunks: ["checkout"],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
      filename: "index.html",
      chunks: ["index"],
    }),
    new Dotenv({
      path: path.resolve(
        __dirname,
        isProduction ? ".env.production" : ".env.development",
      ),
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset/inline",
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
    // config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  return config;
};
