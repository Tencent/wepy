const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');

const banner = `
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */`


const builds = {
  'wepy2': {
    entry: 'packages/wepy2/index.js',
    dest: 'packages/wepy2/dist/wepy.js',
    env: 'development',
    format: 'cjs',
    banner
  },
  'wepy-use-promisify': {
    entry: 'packages/wepy-use-promisify/index.js',
    dest: 'packages/wepy-use-promisify/dist/index.js',
    env: 'development',
    format: 'cjs',
    banner
  }
};

function getConfig (name) {
  let opt = builds[name];
  let config = {
    input: opt.entry,
    external: opt.external,
    plugins: [
      buble({
        objectAssign: 'Object.assign'
      })
    ].concat(opt.options || []),
    output: {
      file: opt.dest,
      format: opt.format,
      banner: opt.bannder,
      name: opt.moduleName || 'WePY'
    }
  }
  if (opt.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opt.env)
    }));
  }
  return config;
}
if (process.env.TARGET) {
  module.exports = getConfig(process.env.TARGET);
} else {
  exports.getBuild = getConfig;
  exports.getAllBuilds = () => Object.keys(builds).map(getConfig);
}

