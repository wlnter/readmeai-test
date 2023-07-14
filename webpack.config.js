// Generated using webpack-cli https://github.com/webpack/webpack-cli
const glob = require('glob')
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV == 'production';

// const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';
const stylesHandler = 'style-loader';

const config = {
    entry: glob.sync('./src/*.js').reduce((acc, path) => {
        const name = path.replace('./src', '').replace('.js', '')
        acc[name] = path
        return acc
    }, {}),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: 'index.html',
        // }),
        // new HtmlWebpackPlugin({
        //     template: 'checkout.html',
        //     chunks: ['checkout']
        // }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset/inline',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';

        config.plugins.push(new MiniCssExtractPlugin());


    } else {
        config.mode = 'development';
    }
    return config;
};
