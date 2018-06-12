import path from 'path';
import util from '../util';
import localPath from '../cli/local-path';
import ask from '../cli/ask';
import * as logger from '../cli/logger';
import * as prompt from '../cli/devtool-prompt';

const DEVTOOLS_DEFAULT_ROOTDIR = {
    // macOS
    'darwin': '/Applications/wechatwebdevtools.app',
    // Windows
    'win32': 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具'
}

const DEVTOOLS_RELATIVEPATH_MAP = {
    // macOS
    'darwin': '/Contents/Resources/app.nw/bin/cli',
    // Windows
    'win32': '/cli.bat'
};

const ACTION_LIST = {
    open: {
        ask: false,
        default: {
            path: util.currentDir
        },
        handler: devtoolOpen,
        prompt: prompt.open,
        args: ['path']
    },
    login: {
        ask: false,
        handler: devtoolLogin,
        prompt: prompt.login,
        args: ['loginQrOutput']
    },
    preview: {
        ask: false,
        default: {
            format: 'terminal',
            path: util.currentDir,
            target: ''
        },
        handler: devtoolPreview,
        prompt: prompt.preview,
        args: ['path', 'previewQrOutput']
    },
    test: {
        ask: false,
        default: {
            path: util.currentDir
        },
        handler: devtoolTest,
        prompt: prompt.test,
        args: ['path']
    },
    upload: {
        ask: true,
        default: {
            path: util.currentDir
        },
        handler: devtoolUpload,
        prompt: prompt.upload,
        args: ['path', 'uploadDesc']
    }
};


const getDevtoolCliPath = (rootPath) => {
    const platform = process.platform;
    const relativePath = DEVTOOLS_RELATIVEPATH_MAP[platform];
    let devtoolsCliPath = '';

    if (!relativePath) {
        return logger.fatal('该平台暂不支持 wepy devtool 功能');
    } else {
        devtoolsCliPath = path.join(rootPath, relativePath);
        if (platform === 'win32') {
            devtoolsCliPath = `'${devtoolsCliPath}'`;
        }
    }
    return devtoolsCliPath;
};

// open devtool operate
function devtoolOpen (bin, options, userArgs) {
    const path = userArgs.path || options.path;

    let cmd = '';
    try {
        if (path === '') {
            cmd = `${bin} -o`;
            logAndExec(cmd);
        } else if (localPath.isLocalPath(path)) {
            cmd = `${bin} -o ${path}`;
            logAndExec(cmd);
        } else {
            logger.fatal('打开项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('打开工具失败：' + e.message);
    }
};

// login devtool operate
function devtoolLogin (bin, options, userArgs) {
    const format = options.format;
    const target = options.target;
    const loginQrOutput = userArgs.loginQrOutput ? userArgs.loginQrOutput : (target
        ? format + '@' + target
        : format);
    try {
        let cmd = loginQrOutput ? `${bin} -l --login-qr-output ${loginQrOutput}` : `${bin} -l`;
        logAndExec(cmd);
    } catch (e) {
        logger.fatal('登录失败：' + e.message);
    }
};

// preview devtool project
function devtoolPreview (bin, options, userArgs) {
    const format = options.format;
    const path = userArgs.path || options.path;
    const target = options.target;
    const previewQrOutput = userArgs.previewQrOutput ? userArgs.previewQrOutput : (target
        ? format + '@' + target
        : format);

    try {
        if (localPath.isLocalPath(path)) {
            previewQrOutput
                ? logAndExec(`${bin} -p ${path} --preview-qr-output ${previewQrOutput}`)
                : logAndExec(`${bin} -p ${path}`)
        } else {
            logger.fatal('预览项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// upload devtool project
function devtoolUpload (bin, options, userArgs) {
    const version = options.version;
    const path = options.path;
    const desc = userArgs.uploadDesc || options.desc;
    const upload = userArgs.path ? userArgs.path : (path
        ? version + '@' + path
        : version);

    try {
        if (localPath.isLocalPath(path)) {
            logAndExec(`${bin} -u ${upload} --upload-desc '${desc}'`)
        } else {
            logger.fatal('预览项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// test devtool project
function devtoolTest (bin, options, userArgs) {
    const path = userArgs.path || options.path;

    try {
        if (localPath.isLocalPath(path)) {
            logAndExec(`${bin} -t ${path}`);
        } else {
            logger.fatal('提交测试失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('提交测试失败：' + e.message);
    }
}

function logAndExec(cmd) {
    console.log('Execute: ' + cmd);
    util.exec(cmd);
}

exports = module.exports = (program, path, cmd) => {
    const config = util.getConfig() || {};
    const rootDir =  (config.devtool && config.devtool.rootDir) || DEVTOOLS_DEFAULT_ROOTDIR[process.platform];
    const bin = getDevtoolCliPath(rootDir);

    let action = ACTION_LIST[program];

    if (action) {
        let options = Object.assign({}, action.default || {});
        let userArgs = {};
        let p;
        action.args.forEach(k => (p = k === 'path' ? path : cmd[k]) ? (userArgs[k] = p) : undefined);

        if (action.ask && Object.keys(userArgs).length === 0) {
            ask(action.prompt, options, () => {
                action.handler(bin, options, userArgs);
            });
        } else {
            action.handler(bin, options, userArgs);
        }
    } else {
        logger.fatal('不支持的命令：wepy devtool' + program + '。运行命令： wepy devtool --help 查看具体用法');
    }
}
