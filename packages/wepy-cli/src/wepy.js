import commander from 'commander';
import path from 'path';
import {exec} from 'child_process';
//import updateNotifier from 'update-notifier';
import util from './util';
import compile from './compile';


const templateDir = path.join(util.cliDir, '../template', path.sep);

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

let generateProject = (name) => {

    util.log('目录：' + name, '创建');

    if (util.mkdir(name) !== true) {
        util.error('创建目录失败。');
        return;
    }

    process.chdir(name);
    util.currentDir = process.cwd();

    let packagePath = path.join(util.currentDir, 'package.json');

    if (util.isFile(packagePath) || util.isDir(path.join(util.currentDir, 'src'))) {
        util.error('目录不为空, 请请勿重复初始化', '错误');
        return;
    }

    let pkg = path.join(templateDir, 'package.json');
    pkg = util.readFile(pkg);
    pkg = JSON.parse(pkg);
    pkg.name = name;

    let dependencies = [
        'wepy',
        'wepy-com-toast',
        'wepy-compiler-less',
        'wepy-compiler-babel',
        'babel-plugin-syntax-export-extensions',
        'babel-plugin-transform-export-extensions',
        'babel-plugin-transform-runtime',
        'babel-preset-es2015',
        'babel-preset-stage-1',
        'babel-runtime',
        'babel-polyfill'
    ];

    util.writeFile(packagePath, JSON.stringify(pkg));
    util.log('配置: ' + 'package.json', '写入');

    let files = util.getFiles(templateDir);

    files.forEach((file) => {
        let target = path.join(util.currentDir, file);
        let opath = path.parse(target);

        util.writeFile(target, util.readFile(path.join(templateDir, file)));
        util.log('文件: ' + file, '拷贝');
    });

    let cmd = 'npm install --save ' + dependencies.join(' ');
    util.log('执行命令: ' + cmd, '执行');
    util.log('可能需要几分钟, 请耐心等待...', '信息');


    util.exec(cmd).then((d) => {
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
    util.exec('npm info wepy-cli', true).then(d => {
        let last = d.match(/latest\:\s\'([\d\.]*)\'/);
        last = last ? last[1] : undefined;
        let me = util.getVersion();
        if (last && last !== me) {
            util.warning(`当前版本${me}，最新版本${last}`);
            util.warning('请关注版本更新日志：https://github.com/wepyjs/wepy/blob/master/CHANGELOG.md');
            util.warning('升级命令：npm install wepy-cli -g');
        }
    }).catch(e => {});
};
checkUpdates();


commander.usage('[command] <options ...>');
commander.option('-v, --version', '显示版本号', () => {
  displayVersion();
});
commander.option('-V', '显示版本号', () => {
  displayVersion();
});
commander.option('-s, --source <source>', '源码目录');
commander.option('-t, --target <target>', '生成代码目录');
commander.option('-f, --file <file>', '待编译wpy文件');
commander.option('--no-cache', '对于引用到的文件，即使无改动也会再次编译');
commander.option('-w, --watch', '监听文件改动');
/*
commander.option('-m, --mode <mode>', 'project mode type(normal, module), default is module, used in `new` command', mode => {
  if(modeList.indexOf(mode) === -1){
    console.log('mode value must one of ' + modeList.join(', '));
    process.exit();
  }
});*/

commander.command('build').description('编译项目').action(projectPath => {
    compile.build(commander);
});

commander.command('new <projectName>').description('生成项目').action(name => {
    generateProject(name || 'temp');
});


commander.command('upgrade').description('升级wepyjs版本').action(name => {
    upgrade();
});

commander.parse(process.argv);  