/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import sass from 'node-sass';

export default function (content, config, file) {
    let result = {};
    return new Promise ((resolve, reject) => {
        if (typeof config.data === 'string') {
          content = config.data + content;
        }
        config.data = content;
        config.file = file;
        sass.render(config, (err, res) => {
            if (err) {
                reject(err);
            } else {
                // Only in 1.7.2, this option is true
                if (config.supportObject) {
                    result.css = res.css.toString();
                    result.map = res.map;
                    result.context = file;
                    result.imports = res.stats.includedFiles;
                    resolve(result);
                } else {
                    // keep the old version. in 1.7.1, it returns a string
                    resolve(res.css);
                }
            }
        });
    });
};
