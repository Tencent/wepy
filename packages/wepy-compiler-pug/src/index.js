/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import pug from 'pug';

let compiler = function (content, config) {
    let data = config.data;
    let p;
    delete config.data;
    try {
        let fn = pug.compile(content, config);
        let html = fn(data);
        p = Promise.resolve(html);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};

compiler.sync = function (content, config) {
    let data = config.data;
    let p, html;
    delete config.data;
    let fn = pug.compile(content, config);
    html = fn(data);
    return html;
};

export default compiler;