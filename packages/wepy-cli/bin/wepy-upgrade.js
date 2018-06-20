const exec = require('child_process').exec;
//const util = require('../util');


function upgradeCLI (cb) {
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
}

function upgradeWepy (cb) {
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
    });
    fcmd.stdout.on('data', (d) => {
        console.log(d.substring(d, d.length - 1));
    });
}

exports = module.exports = (program) => {
    if (program.cli) {
        upgradeCLI();
    } else {
        upgradeWepy();
    }
};
