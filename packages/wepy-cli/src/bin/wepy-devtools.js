#!/usr/bin/env node

import chalk from 'chalk';
import util from '../util';
import { isTrue, combineURL } from '../cli/util';
import { exec } from 'child_process';
import localPath from '../cli/local-path';

const DEVTOOLS_RELATIVEPATH_MAP = {
  // macOS
  'darwin': '/Contents/Resources/app.nw/bin/cli',
  // Windows
  'win32': '/cli.bat'
};

const getDevtoolsCliPath = (rootPath) => {
  const relativePath = DEVTOOLS_RELATIVEPATH_MAP[process.platform];

  if (!relativePath) {
    console.log(chalk.red('该平台暂不支持 wepy publish 功能'));
  } else {
    return combineURL(rootPath, relativePath);
  }
};

// open devtools operate
const devtoolsOpen = (bin, program) => {
  const projectPath = program.open;
  const isLocalPath = localPath.isLocalPath(projectPath);

  try {
    if (isTrue(projectPath)) {
      util.exec(`${bin} -o`);  
    } else if (isLocalPath) {
      util.exec(`${bin} -o ${projectPath}`)
    } else {
      console.log(chalk.red('打开项目失败：项目路径必须是本地路径'));
    }
  } catch (e) {
    console.log(chalk.red('打开工具失败：' + e.message));
  }
};

// login devtools operate
const devtoolsLogin = (bin, program) => {
  const login = program.login;
  const loginQrOutput = program.loginQrOutput;
  
  try {
    if (login) {
      loginQrOutput
        ? util.exec(`${bin} -l --login-qr-output ${loginQrOutput}`)
        : util.exec(`${bin} -l`)
    }
  } catch (e) {
    console.log(chalk.red('登录失败：' + e.message));
  }
};

// preview devtools project
const devtoolsPreview = (bin, program) => {
  const projectRoot = program.preview;
  const previewQrOutput = program.previewQrOutput;

  try {
    if (localPath.isLocalPath(projectRoot)) {
      previewQrOutput
        ? util.exec(`${bin} -p ${projectRoot} --preview-qr-output ${previewQrOutput}`)
        : util.exec(`${bin} -p ${projectRoot}`)
    }
  } catch (e) {
    console.log(chalk.red('预览项目失败：' + e.message));
  }
}

// upload devtools project
const devtoolsUpload = (bin, program) => {
  const upload = program.upload;
  const uploadDes = program.uploadDes || 'release';

  try {
    if (upload) {
      util.exec(`${bin} -u ${upload} --upload-desc ${uploadDes}`)
    }
  } catch (e) {
    console.log(chalk.red('预览项目失败：' + e.message));
  }
}

// test devtools project
const devtoolsTest = (bin, program) => {
  const testPath = program.test;

  try {
    if (localPath.isLocalPath(testPath)) {
      util.exec(`${bin} -t ${testPath}`);
    } else {
      console.log(chalk.red('提交测试失败：项目路径必须是本地路径'));
    }
  } catch (e) {
    console.log(chalk.red('提交测试失败：' + e.message));
  }
}

exports = module.exports = (program) => {
  const config = util.getConfig() || {};

  if (config.devtools && config.devtools.rootDir) {
    const rootDir = config.devtools.rootDir;
    const bin = getDevtoolsCliPath(rootDir);

    program.open && devtoolsOpen(bin, program);
    program.login && devtoolsLogin(bin, program);
    program.preview && devtoolsPreview(bin, program);
    program.upload && devtoolsUpload(bin, program);
    program.test && devtoolsTest(bin, program);
  } else {
    console.log(chalk.red('请检查 devtool.rootPath 的配置'));
  }
}