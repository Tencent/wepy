/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import {transform} from 'babel-core';

export default function (content, config) {
    let p;
    if (content.length >= 500 * 1024) {
        console.warn('[WARN]: Some file is greater than 500KB, babel ignored it.');
        return Promise.resolve(content);
    }
    try {
        let rst = transform(content, config);
        p = Promise.resolve(rst);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};
