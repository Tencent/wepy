/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import loader from './loader';
import util from './util';

export default function (filepath) {
    let config = util.getConfig();

    if (config.eslint) {
        const compiler = loader.load('wepy-eslint');

        if (!compiler) {
            util.warning('未安装wepy-eslint，执行npm install wepy-eslint --save-dev 或者在wepy.config.js中关闭eslint选项');
            return;
        }
        // 使用 eslint
        const esConfig = Object.assign({
            useEslintrc: true,
            extensions: ['.js', config.wpyExt || '.wpy']
        }, config.eslint === true ? {} : config.eslint);
        esConfig.output = false;
        let rst = compiler(esConfig, filepath);
        if (rst) {
            util.writeLog({stack: rst}, 'error');
            console.log(rst);
        }
    }
};
