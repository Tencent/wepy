import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';


export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(jpg|png|jpge)$'),
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