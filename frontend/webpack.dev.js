const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './index.js'),
    },
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, './dist'),
        open: true,
        compress: true,
        hot: true,
        port: 8080,
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.devBundle.js',
    } 

}