const HTMLWebpackPlugin = require('html-webpack-plugin')
const path = require('path');

module.exports = {
    entry: {
        FirstPage: './src/pages/FirstPage/FirstPage.js',
        MainPage: "./src/pages/MainPage/MainPage.js",
        ChatPage: './src/pages/Chat/chat.js'
    },    
    mode:'production',
    output: {
        path: path.resolve(__dirname, 'build'),
        // filename: 'bundle.js',
        filename: '[name].js',
        publicPath: '/'
    },   
    plugins: [       
        new HTMLWebpackPlugin({
            // template: "./index.html",
            template: "src/pages/FirstPage/FirstPage.html",
            chunks: ['FirstPage']
        }),
        new HTMLWebpackPlugin({
            filename: 'MainPage.html',
            template: "src/pages/MainPage/MainPage.html",   
            chunks: ['MainPage']
        }),
        new HTMLWebpackPlugin({
            filename: 'ChatPage.html',
            template: 'src/pages/Chat/ChatPage.html',
            chunks: ['ChatPage']
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/inline',
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    },
    devServer: {
        port: 8080,
        historyApiFallback: true,
        hot: true,
        // contentBase: path.resolve(__dirname, './dist'),        
        open: true,
        compress: true,
    },
}