const babel = require('rollup-plugin-babel');
const fs = require('fs');
const path = require('path');
const babelRc = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
const rollup = require( 'rollup' );

// 常量
const rootPath = process.cwd();
const appPath = path.join(rootPath, 'src');
const distPath = path.join(rootPath, 'dist');

/**
 * 根据入口路径编译
 */
function getOption(entry) {
    return {
        entry: entry,
        plugins: [
            babel({
                babelrc: false,
                presets: ['es2015-minimal-rollup'].concat(babelRc.presets.slice(1)),
                exclude: 'node_modules/**'
            }),
        ],
    }
}

/* ------------------------------------
 * 主程序
 * ------------------------------------ */

async function main() {
    await rollup.rollup(getOption(path.join(appPath, 'index.js')))
    .then(bundle => {
        bundle.write({
            dest: path.join(distPath, 'cqaso_error.js'),
            format: 'umd',
            moduleName: 'CqError',
            sourceMap: false,
            useStrict: false,
        });
    })

    console.log('✅ rollup success.');
}

main();
