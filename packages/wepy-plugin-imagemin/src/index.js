/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';


export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(jpg|png|jpeg)$'),
            config: {
                jpg: {},
                png: {quality: '65-80'}
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
                action: '压缩',
                file: op.file
            });
            imagemin([op.file], '', {
                plugins: [
                    imageminMozjpeg(this.setting.config.jpg),
                    imageminPngquant(this.setting.config.png)
                ]
            }).then((files) => {
                op.code = files[0].data;
                op.next();
            }).catch((e) => {
                op.err = e;
                op.catch();
            });
        }
    }
}