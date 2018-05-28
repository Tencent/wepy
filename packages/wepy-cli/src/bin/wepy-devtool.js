import path from 'path';
import util from '../util';
import localPath from '../cli/local-path';
import * as logger from '../cli/logger';

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

const getDevtoolCliPath = (rootPath) => {
    const platform = process.platform;
    const relativePath = DEVTOOLS_RELATIVEPATH_MAP[platform];
    let devtoolsCliPath = '';

    if (!relativePath) {
        return logger.fatal('该平台暂不支持 wepy devtool 功能');
    } else {
        devtoolsCliPath = path.join(rootPath, relativePath);
        if (platform === 'win32') {
            devtoolsCliPath = `"${devtoolsCliPath}"`;
        }
    }
    return devtoolsCliPath;
};

// open devtool operate
const devtoolOpen = (bin, program) => {
    const projectPath = program.open;
    const isLocalPath = localPath.isLocalPath(projectPath);

    try {
        if (util.isTrue(projectPath)) {
            util.exec(`${bin} -o`);  
        } else if (isLocalPath) {
            util.exec(`${bin} -o ${projectPath}`)
        } else {
            logger.fatal('打开项目失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('打开工具失败：' + e.message);
    }
};

// login devtool operate
const devtoolLogin = (bin, program) => {
    const login = program.login;
    const loginQrOutput = program.loginQrOutput;
    
    try {
        if (login) {
            loginQrOutput
                ? util.exec(`${bin} -l --login-qr-output ${loginQrOutput}`)
                : util.exec(`${bin} -l`)
        }
    } catch (e) {
        logger.fatal('登录失败：' + e.message);
    }
};

// preview devtool project
const devtoolPreview = (bin, program) => {
    const projectRoot = program.preview || process.cwd();
    const previewQrOutput = program.previewQrOutput;

    try {
        if (localPath.isLocalPath(projectRoot)) {
            previewQrOutput
                ? util.exec(`${bin} -p ${projectRoot} --preview-qr-output ${previewQrOutput}`)
                : util.exec(`${bin} -p ${projectRoot}`)
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// upload devtool project
const devtoolUpload = (bin, program) => {
    const upload = program.upload || `${util.getProjectVersion()}@${process.cwd()}}`;
    const uploadDes = program.uploadDes || 'release';

    try {
        if (upload) {
            util.exec(`${bin} -u ${upload} --upload-desc ${uploadDes}`)
        }
    } catch (e) {
        logger.fatal('预览项目失败：' + e.message);
    }
}

// test devtool project
const devtoolTest = (bin, program) => {
    const testPath = program.test || process.cwd();

    try {
        if (localPath.isLocalPath(testPath)) {
            util.exec(`${bin} -t ${testPath}`);
        } else {
            logger.fatal('提交测试失败：项目路径必须是本地路径');
        }
    } catch (e) {
        logger.fatal('提交测试失败：' + e.message);
    }
}

exports = module.exports = (action, value, program) => {
    const config = util.getConfig() || {};
    const rootDir =  (config.devtool && config.devtool.rootDir) || DEVTOOLS_DEFAULT_ROOTDIR[process.platform];
    const bin = getDevtoolCliPath(rootDir);  

    program = Object.assign({}, program, {
        [action]: value || true
    });

    program.open && devtoolOpen(bin, program);
    program.login && devtoolLogin(bin, program);
    program.preview && devtoolPreview(bin, program);
    program.upload && devtoolUpload(bin, program);
    program.test && devtoolTest(bin, program);
}