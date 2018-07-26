'use strict';

/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * 
 * @modifier fengxinming
 * 迁移来自https://github.com/fengxinming/wepy-compiler-pug
 */


const jade = require('jade');
const pug = require('pug');
const pretty = require('pretty');

const util = require('./util');

const defaults = {
    cache: false,
    pretty: true
};

const engineSource = {
    jade,
    pug
};

function render(content, config) {
    let engine = config.engine;
    if (!engine) {
        engine = 'pug';
    }
    engine = engineSource[engine];
    if (!engine) {
        throw new Error(`Engine ${engine} not found`);
    }
    const indent = util.getIndent(content);
    if (indent.firstLineIndent) {
        content = util.fixIndent(content, indent.firstLineIndent * -1, indent.char);
    }
    config = Object.assign({}, defaults, config);
    let html = engine.compile(content, config)(config);

    // pug模板准备移除这个"pretty"属性，官方不建议使用它，
    // 我们额外增加一个"enforcePretty"属性强行美化模板
    if (config.enforcePretty) {
        html = pretty(html)
    }
    return html;
}

function compiler(content, config) {
    return new Promise((resolve, reject) => {
        try {
            let html = render(content, config);
            resolve(html);
        } catch (e) {
            reject(e);
        }
    });
};

compiler.sync = function (content, config) {
    return render(content, config);
};

module.exports = compiler;
