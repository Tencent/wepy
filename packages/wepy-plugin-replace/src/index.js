/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';

export default class {

    constructor(c = {}) {
        const def = {
            filter: /\w$/,
            config: {
            }
        };

        if (Array.isArray(c)) {
            this.setting = c.map(s => Object.assign({}, def, s));
            return;
        }

        if (c instanceof Object && !c.filter) {
            this.setting = Object.assign({}, c);
            return;
        }
        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        let settings = [];

        if (setting instanceof Array) {
            settings = settings.concat(setting);
        } else if (setting instanceof Object && !setting.filter) {
            for (let key in setting) {
                let value = setting[key];
                if (value.filter) {
                    settings.push(value);
                }
            }
        } else if (setting instanceof Object && setting.filter) {
            settings.push(setting);
        }

        settings.forEach((setting) => {
            if (op.code !== null && setting.filter.test(op.file)) {
                op.output && op.output({
                    action: '变更',
                    file: op.file
                });

                let config = setting.config;
                let configs = [];

                if (config instanceof Array) {
                    configs = configs.concat(config);
                } else if (config instanceof Object && !config.find) {
                    for (let key in config) {
                        let value = config[key];
                        if (value.find) {
                            configs.push(value);
                        }
                    }
                } else if (config instanceof Object && config.find) {
                    configs.push(config);
                }

                configs.forEach((config) => {
                    op.code = op.code.replace(config.find, config.replace);
                })
            }
        })

        op.next();
    }
}
