/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import uglify from 'uglify-js';

export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(js)$'),
            config: {
                compress: {warnings: false}
            }
        };

        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        if (!setting.filter.test(op.file)) {
            op.next();
        } else {
            //util.output('压缩', op.file);
            op.output && op.output({
                action: '压缩',
                file: op.file
            });
            this.setting.config.fromString = true;
            let rst = uglify.minify(op.code, this.setting.config);
            let k;
            for (k in rst)
                op[k] = rst[k];
            op.next();
        }
    }
}