/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import commander from 'commander';
import path from 'path';
import {exec} from 'child_process';
//import updateNotifier from 'update-notifier';
import util from './util';
import compile from './compile';

let displayVersion = () => {
    let version = util.getVersion();
    let chars = [
        '   _    _  ____  ____  _  _ ',
        '( \/\/ )( ___)(  _ \( \/ )',
        ' )    (  )__)  )___/ \  / ',
        '(__/\__)(____)(__)   (__) ',
        '                                         '
    ].join('\n');
    console.log('\n v' + version + '\n');
    console.log(chars);
};

let generateProject = (name, config) => {

    let inPlace = !name || name === '.';

    if (inPlace) {
        name = process.cwd().split(path.sep).pop();
        util.log('使用当前目录：' + name);
    } else {
        util.log('目录：' + name, '创建');

        if (util.mkdir(name) !== true) {
            util.error('创建目录失败。');
            return;
        }

        process.chdir(name);
    }

    util.currentDir = process.cwd();

    let packagePath = path.join(util.currentDir, 'package.json');

    if (util.isFile(packagePath) || util.isDir(path.join(util.currentDir, 'src'))) {
        util.error('目录不为空, 请请勿重复初始化', '错误');
        return;
    }

    const tplDir = '../templates/';
    const templateDir = path.join(util.cliDir, tplDir + 'template', path.sep);
    const emptyDir = path.join(util.cliDir, tplDir + 'empty', path.sep);
    const confDir = path.join(util.cliDir, tplDir + 'conf', path.sep);

    let template = config.empty ? emptyDir : templateDir;

    const useRedux = !config.empty && config.redux;

    let pkg = path.join(template, 'package.json');
    pkg = util.readFile(pkg);
    pkg = JSON.parse(pkg);
    pkg.name = name;

    let dependencies = [
        'wepy'
    ];
    let devDependencies = [
        'wepy-compiler-babel',
        'babel-plugin-transform-decorators-legacy',
        'babel-plugin-transform-export-extensions',
        'babel-plugin-transform-class-properties',
        'babel-plugin-transform-object-rest-spread',
        'babel-preset-env',
        'wepy-compiler-less',
        'cross-env'
    ];
    const eslintDeps = [
        'eslint@3.18.0',
        'babel-eslint@7.2.1',
        'eslint-config-standard@7.1.0',
        'eslint-friendly-formatter@2.0.7',
        'eslint-plugin-html@2.0.1',
        'eslint-plugin-promise@3.5.0',
        'eslint-plugin-standard@2.0.1',
        'wepy-eslint'
    ];
    const reduxDeps = [
        'redux',
        'wepy-redux',
        'redux-promise',
        'redux-actions'
    ];

    if (!config.empty) {
        dependencies.push('wepy-com-toast');
        dependencies.push('wepy-async-function');
    }
    if (useRedux) {
        // concat more faster than push.apply
        dependencies = dependencies.concat(reduxDeps);
    }

    if (config.lint) {
        devDependencies = devDependencies.concat(eslintDeps);
    }

    util.writeFile(packagePath, JSON.stringify(pkg));
    util.log('配置: ' + 'package.json', '写入');

    let files = util.getFiles(template).filter(file => file !== 'package.json');

    const copyFn = function (sourcePath) {
        return function (file) {
            // https://github.com/npm/npm/issues/12917
            // npm will exclude .gitignore when packaging
            // so rename '.gitignore' to 'gitignore' and rename back when copy
            let append = file === 'gitignore' ? '.' : '';
            let target = path.join(util.currentDir, append + file);

            // --on-lint will not copy eslint config
            if (['.editorconfig', '.eslintignore', '.eslintrc'].indexOf(file) !== -1 && !config.lint)
                return;

            // 只有 redux 的项目拷贝 redux 相关内容 且做替换
            const unReduxFiles = [
                path.join('src', 'app.wpy'),
                path.join('src', 'pages', 'index.wpy'),
                path.join('src' , 'components', 'counter.wpy')
            ];
            const reduxFiles = [
                path.join('src', 'app-redux.wpy'),
                path.join('src', 'pages', 'index-redux.wpy'),
                path.join('src', 'components', 'counter-redux.wpy')
            ];
            const index = reduxFiles.indexOf(file);
            if (useRedux) {
                if (unReduxFiles.indexOf(file) !== -1) {
                    return;
                }
                // 将 reduxFiles 的文件重新命名
                if (index >= 0) {
                    target = path.join(util.currentDir, unReduxFiles[index]);
                }
            } else if (index !== -1 || file.indexOf(path.join('src', 'store')) === 0) {
                // 同样排除 store 内容
                return;
            }

            let fileContent = util.readFile(path.join(sourcePath, file));
            if (file === 'wepy.config.js') {
                if (!config.lint) {
                    // 去掉 eslint: true,
                    fileContent = fileContent.replace(/\s*eslint\: true,/ig, '')
                }
            }
            util.writeFile(target, fileContent);
            util.log('文件: ' + file, '拷贝');
        }
    }
    files.forEach(copyFn(template));

    let cmd = 'npm install --save ' + dependencies.join(' ');
    let cmdDev = 'npm install --save-dev ' + devDependencies.join(' ');
    util.log('执行命令: ' + cmd, '执行');
    util.log('执行命令: ' + cmdDev, '执行');
    util.log('可能需要几分钟, 请耐心等待...', '信息');
    // 不能并行执行安装依赖
    util.exec(cmd).then(d => {
        return util.exec(cmdDev)
    }).then(d => {
        util.log('安装依赖完成', '完成');

        let cmd = 'wepy build';
        util.log('执行命令: ' + cmd, '执行');
        util.log('可能需要几分钟, 请耐心等待...', '信息');

        util.exec(cmd).then(d => {
            util.log('代码编译完成', '完成');
            util.log('项目初始化完成, 可以开始使用小程序。', '完成');
        }).catch(e => {
            util.log('代码编译出错', '错误');
        })
    }).catch(e => {
        util.log('安装依赖出错', '错误');
    });
};

let upgradeCLI = (cb) => {
    let cmd = 'npm install wepy-cli -g';
    util.log('升级中，可能需要几分钟, 请耐心等待...', '信息');
    util.log('执行命令: ' + cmd, '执行');
    let fcmd = exec(cmd, () => {
        util.log('完成安装最新版本wepy-cli', '完成');
        cb && cb();
    });
    fcmd.stdout.on('data', (d) => {
        console.log(d.substring(d, d.length - 1));
    });
};

let upgradeWepy = (cb) => {
    let cmd = 'npm install wepy --save';
    util.log('升级中，可能需要几分钟, 请耐心等待...', '信息');
    util.log('执行命令: ' + cmd, '执行');
    let fcmd = exec(cmd, () => {
        util.log('完成安装最新版本wepy', '完成');

        let cmd = 'wepy build --no-cache';
        util.log('执行命令: ' + cmd, '执行');

        let fcmd3 = exec(cmd, () => {
            util.log('完成升级', '完成');
            cb && cb();
        });
        fcmd3.stdout.on('data', (d) => {
            console.log(d.substring(d, d.length - 1));
        });
    })
    fcmd.stdout.on('data', (d) => {
        console.log(d.substring(d, d.length - 1));
    });
};



let upgrade = (name) => {
    upgradeWepy();
};


let checkUpdates = () => {
    util.timeoutExec(3, 'npm info wepy-cli', true).then(d => {
    //util.exec('npm info wepy-cli', true).then(d => {
        let last = d.match(/latest\:\s\'([\d\.]*)\'/);
        last = last ? last[1] : undefined;
        let me = util.getVersion();
        if (last && last !== me) {
            let lastArr = last.split('.');
            let meArr = me.split('.');
            let lastBig = lastArr[0] + '.' + lastArr[1];
            let meBig = meArr[0] + '.' + meArr[1];
            let fixedLast = lastArr[2];
            let fixedMe = meArr[2];

            if (lastBig - meBig > 0) {
                util.warning(`当前版本${me}，最新版本${last}`);
                util.warning('跨版本升级可能不去向下兼容，升级前请查看CHANGLOG了解所有更新。');
            } else {
                if (parseInt(fixedLast) - parseInt(fixedMe) >= 0) {
                    util.warning(`当前版本${me}，最新版本${last}`);
                    util.warning('请关注版本更新日志：https://github.com/wepyjs/wepy/blob/master/CHANGELOG.md');
                    util.warning('升级命令：npm install wepy-cli -g');
                } else {
                    let tag = fixedMe.replace(/\d/g, '').replace(/-/, '');
                    util.warning(`当前使用的是${tag}版本${me}，无特殊情况建议使用正式版本${last}`);
                    util.warning(`升级正式版命令：npm install wepy-cli@${last} -g`);
                }
            }
        }
    }).catch(e => {});
};
checkUpdates();

if (Number(process.version.match(/^v(\d+\.\d+)/)[1]) < 5) {
    util.error('检测到当前Node.js版本过低，请升级Node.js到5以上版本，NPM升级到3以上版本。');
    process.exit(1);
}

commander.usage('[command] <options ...>');
commander.option('-v, --version', '显示版本号', () => {
  displayVersion();
});

commander.command('build')
    .description('编译项目')
    .option('-f, --file <file>', '待编译wpy文件')
    .option('-s, --source <source>', '源码目录')
    .option('-t, --target <target>', '生成代码目录')
    .option('-o, --output <type>', '编译类型：web，weapp。默认为weapp')
    .option('-p, --platform <type>', '编译平台：browser, wechat，qq。默认为browser')
    .option('-w, --watch', '监听文件改动')
    .option('--no-cache', '对于引用到的文件，即使无改动也会再次编译')
    .action(cmd => {
        if (compile.init(cmd)) {
            compile.build(cmd);
        }
    }
);

commander.command('new <projectName>')
    .description('生成项目')
    .option('--empty', '使用new生成项目时，生成空项目内容')
    .option('--no-lint', '使用new生成项目时，禁用eslint')
    .option('--redux', '使用new生成项目时，增加redux相关内容')
    .action((name, cmd) => {
        generateProject(name || 'temp', cmd);
    }
);

commander.command('upgrade').description('升级wepyjs版本').action(name => {
    upgrade();
});

commander.parse(process.argv);
