/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import util from '../util';
import loader from '../loader';

import rpxConvert from '../style-compiler/rpx-convert';
import scopedHandler from '../style-compiler/scoped';

import { getInstance } from './modulemap';

export default {

    compile (wpy) {
        let mmap = getInstance();
        let config = util.getConfig();

        let allPromises = [];
        wpy.style.forEach((style, i) => {
            let lang = style.type || 'css';
            const content = style.code;
            const scoped = style.scoped;

            if (lang === 'scss')
                lang = 'sass';

            let compiler = loader.loadCompiler(lang);

            if (!compiler) {
                throw `未发现相关 ${lang} 编译器配置，请检查wepy.config.js文件。`;
            }

            allPromises.push(compiler(content, config.compilers[lang] || {}, style.src).then((css) => {
                // 处理 scoped
                if (scoped) {
                    // 存在有 scoped 的 style
                    return scopedHandler(wpy.moduleId, css).then((cssContent) => {
                        let styleId = mmap.add(style.src + '-style', {
                            type: 'style',
                            source: wpy
                        });
                        wpy.style.id = styleId;
                        style.code = rpxConvert(cssContent);
                    });
                } else {
                    let styleId = mmap.add(style.src + '-style', {
                        type: 'style',
                        source: wpy
                    });
                    wpy.style.id = styleId;
                    style.code = rpxConvert(css);
                }
            }));

        });

        return Promise.all(allPromises);
    }
}
