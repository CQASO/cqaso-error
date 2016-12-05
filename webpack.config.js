var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

module.exports = {
    entry: {
        index: path.resolve('src', 'index.js'),
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: 'examples',
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: "[name].chunk.js"
    },
    devTool: 'cheap-module-eval-source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
};
