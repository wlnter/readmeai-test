// Generated using webpack-cli https://github.com/webpack/webpack-cli
const glob = require("glob");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HookShellScriptPlugin = require('hook-shell-script-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

// const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';
const stylesHandler = "style-loader";

const mainEntry = glob.sync("./src/*.js").reduce((acc, path) => {
  const name = path
    .replace("./src/", "")
    .replace(".js", "")
    .replace(".json", "");
  acc[name] = {
    import: path,
    filename: "./script/[name].js",
  };
  return acc;
}, {});

// const expComponentEntry = glob
//   .sync("./src/experiment/component/**/*.js")
//   .reduce((acc, path) => {
//     const name = path
//       .replace("./src/experiment/component/", "")
//       .replace("/index.js", "");
//     acc[name] = {
//       import: path,
//       filename: "./experiment/component/[name].js",
//     };
//     return acc;
//   }, {});

const config = {
  entry: mainEntry,
  output: {
    clean: true,
  },
  resolve: {
    extensions: [".js", ".json"],
  },
  watch: false,
  watchOptions: {
    ignored: /node_modules/,
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
        {
          from: path.resolve(__dirname, "src/experiment/bucket"),
          to: path.resolve(__dirname, "dist/experiment/bucket"),
        },
        {
          from: path.resolve(__dirname, "src/experiment/config"),
          to: path.resolve(__dirname, "dist/experiment/config"),
        },
      ],
    }),
    new Dotenv({
      path: path.resolve(
        __dirname,
        isProduction ? ".env.production" : ".env.development"
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
  } else {
    config.mode = "development";
    // config.plugins.push(new HookShellScriptPlugin({
    //   afterEmit: [`node ./mock.mjs ${process.env.NODE_ENV}`],
    // }));
  }
  return config;
};
