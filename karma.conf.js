'use strict';

const path = require('path');
const webpack = require('webpack');


const configuration = {
    // 使用的测试框架，Mocha, chai
    frameworks: ['mocha', 'chai', 'sinon'],
    // 测试页面需要加载的资源
    files: [
        './node_modules/babel-polyfill/dist/polyfill.js',
        'test/**/*.js'
    ],
    // 会先对文件做处理，然后载入处理结果
    preprocessors: {
        'test/**/*.js': ['webpack']
    },
    webpack: {
        devtool: 'cheap-module-eval-source-map',
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel'
                }
            ],
            // 添加webpack编译相关配置，在编译源码时，需要定义preLoaders，并使用isparta-loader做代码覆盖率打点
            preLoaders: [
                {
                    test: /\.js$/,
                    include: [path.resolve('src/')],
                    loader: 'isparta'
                }
            ]
        },
        plugins: [new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('test')})]
    },
    webpackMiddleware: {
        noInfo: true
    },
    // 安装的插件列表
    plugins: [
        'karma-mocha',
        'karma-chai',
        'karma-sinon',
        'karma-coveralls',
        'karma-webpack',
        'karma-phantomjs-launcher',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-coverage',
        'karma-spec-reporter'
    ],
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },
    // 需要测试的浏览器
    browsers: [
        'PhantomJS', 'Firefox'
    ],
    // 需要生成哪些代码报告
    reporters: [
        'spec', 'coverage'
    ],
    // 覆盖率报告要如何生成(包括覆盖率页面、lcov.info、coverage.json、以及命令行里的提示)
    coverageReporter: {
        dir: 'coverage',
        reporters: [
            {
                type: 'json',
                subdir: '.',
                file: 'coverage.json'
            }, {
                type: 'lcov',
                subdir: '.'
            }, {
                type: 'text-summary'
            }
        ]
    },
    singleRun: process.env.TRAVIS ? true : false,
    autoWatch: process.env.TRAVIS ? false : true,
};

if (process.env.TRAVIS) {
    configuration.browsers.push('Chrome_travis_ci');
    configuration.reporters.push('coveralls');
} else {
    configuration.browsers.push('Chrome');
}

module.exports = function(config) {
    config.set(configuration);
};
