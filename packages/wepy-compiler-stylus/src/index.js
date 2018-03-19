/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import stylus from 'stylus';
import path from 'path';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        let opath = path.parse(file);
        config.paths = [opath.dir];
        config.filename = opath.base;

        let instance = stylus(content);

        for (let k in config) {
            instance.set(k, config[k]);
        }
        let imports = instance.deps();

        instance.render(function (err, css) {
            if (err) reject(err);
            else {
                // Only in 1.7.2, this option is true
                if (config.supportObject) {
                    let result = {};
                    result.css = css;
                    result.context = file;
                    result.imports = imports;
                    resolve(result);
                } else {
                    resolve(css);
                }
            }
        });
    });
};
