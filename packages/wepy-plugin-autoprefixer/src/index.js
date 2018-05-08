/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(wxss)$'),
            config: {
                browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
            }
        };

        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        if (!setting.filter.test(op.file)) {
            op.next();
        } else {
            op.output && op.output({
                action: '变更',
                file: op.file
            });

            let prefixer = postcss([ autoprefixer(this.setting.config) ]);

            prefixer.process(op.code, { from: undefined }).then((result) => {
                op.code = result.css;
                op.next();
            }).catch(e => {
                op.err = e;
                op.catch();
            });
        }
    }
}