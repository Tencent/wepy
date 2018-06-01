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

const ACTION_METHOD_MAP = {
    'open': devtoolOpen,
    'login': devtoolLogin,
    'preview': devtoolPreview,
    'upload': devtoolUpload,
    'test': devtoolTest
}

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
function devtoolOpen (bin, options) {
    const path = options.path;

    try {
        if (path === '') {
            util.exec(`${bin} -o`);  
        } else if (localPath.isLocalPath(path)) {
            util.exec(`${bin} -o ${path}`)
        } else {
            logger.fatal('打开项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('打开工具失败：' + e.message);
    }
};

// login devtool operate
function devtoolLogin (bin, options) {
    const format = options.format;
    const target = options.target;
    const loginQrOutput = target
        ? format + '@' + target
        : format;
    
    try {
        util.exec(`${bin} -l --login-qr-output ${loginQrOutput}`)
    } catch (e) {
        logger.fatal('登录失败：' + e.message);
    }
};

// preview devtool project
function devtoolPreview (bin, options) {
    const format = options.format;
    const path = options.path;
    const target = options.target;
    const previewQrOutput = target
        ? format + '@' + target
        : format;

    try {
        if (localPath.isLocalPath(path)) {
            previewQrOutput
                ? util.exec(`${bin} -p ${path} --preview-qr-output ${previewQrOutput}`)
                : util.exec(`${bin} -p ${path}`)
        } else {
            logger.fatal('预览项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// upload devtool project
function devtoolUpload (bin, options) {
    const version = options.version;
    const path = options.path;
    const desc = options.desc;
    const upload = path
        ? version + '@' + path
        : version;

    try {
        if (localPath.isLocalPath(path)) {
            util.exec(`${bin} -u ${upload} --upload-desc ${desc}`)
        } else {
            logger.fatal('预览项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// test devtool project
function devtoolTest (bin, options) {
    const path = options.path;

    try {
        if (localPath.isLocalPath(path)) {
            util.exec(`${bin} -t ${path}`);
        } else {
            logger.fatal('提交测试失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('提交测试失败：' + e.message);
    }
}

exports = module.exports = (program) => {
    const config = util.getConfig() || {};
    const rootDir =  (config.devtool && config.devtool.rootDir) || DEVTOOLS_DEFAULT_ROOTDIR[process.platform];
    const bin = getDevtoolCliPath(rootDir);  

    Object.keys(ACTION_METHOD_MAP)
        .every(action => {
            if (action === program) {
                const options = {}
                ask(prompt[action], options, () => {
                    ACTION_METHOD_MAP[action](bin, options)
                })
                return false
            } else {
                return true
            }
        })
}